const { nanoid } = require('nanoid');
const pool = require('../../validator/pool');
const ClientError = require('../../exceptions/ClientError');

class PlaylistsService {
  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists (id, name, owner) VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };
    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new ClientError('Gagal membuat playlist', 500);
    }
    return result.rows[0].id;
  }

  async getPlaylistsByUser(userId) {
    const query = {
      text: `
        SELECT DISTINCT p.id, p.name, u.username
        FROM playlists p
        JOIN users u ON p.owner = u.id
        LEFT JOIN collaborations c ON p.id = c.playlist_id
        WHERE p.owner = $1 OR c.user_id = $1
      `,
      values: [userId],
    };
    const result = await pool.query(query);
    return result.rows;
  }

  async verifyPlaylistOwner(playlistId, userId) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const result = await pool.query(query);

    if (!result.rows.length) {
      throw new ClientError('Playlist tidak ditemukan', 404);
    }

    if (result.rows[0].owner !== userId) {
      throw new ClientError('Anda tidak berhak mengakses resource ini', 403);
    }
    return true;
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
      return true;
    } catch (err) {
      if (err instanceof ClientError && err.statusCode === 403) {
        const query = {
          text: 'SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
          values: [playlistId, userId],
        };
        const result = await pool.query(query);

        if (!result.rows.length) {
          throw new ClientError('Anda tidak memiliki izin untuk mengakses playlist', 403);
        }
        return true;
      }
      throw err;
    }
  }

  async addSongToPlaylist(playlistId, songId, addedBy) {
    // verify song exists
    const songExistsQuery = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [songId],
    };
    const songExistsResult = await pool.query(songExistsQuery);
    if (!songExistsResult.rows.length) {
      throw new ClientError('Lagu tidak ditemukan', 404);
    }

    const id = `ps-${nanoid(16)}`;
    const q = {
      text: 'INSERT INTO playlistsongs (id, playlist_id, song_id) VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const res = await pool.query(q);
    if (!res.rows.length) {
      throw new ClientError('Gagal menambahkan lagu ke playlist', 500);
    }

    // record activity (use addedBy)
    try {
      const actId = `act-${nanoid(16)}`;
      const actQuery = {
        text: `INSERT INTO playlist_song_activities
               (id, playlist_id, song_id, user_id, action)
               VALUES ($1, $2, $3, $4, $5)`,
        values: [actId, playlistId, songId, addedBy, 'add'],
      };
      await pool.query(actQuery);
    } catch (e) {
      // ignore activity errors
    }

    return res.rows[0].id;
  }

  async getPlaylistWithSongs(playlistId) {
    const playlistQuery = {
      text: `SELECT p.id, p.name, u.username
             FROM playlists p
             JOIN users u ON p.owner = u.id
             WHERE p.id = $1`,
      values: [playlistId],
    };
    const playlistResult = await pool.query(playlistQuery);

    if (!playlistResult.rows.length) {
      throw new ClientError('Playlist tidak ditemukan', 404);
    }

    const songsQuery = {
      text: `SELECT s.id, s.title, s.performer
             FROM playlistsongs ps
             JOIN songs s ON ps.song_id = s.id
             WHERE ps.playlist_id = $1`,
      values: [playlistId],
    };
    const songsResult = await pool.query(songsQuery);

    const playlist = playlistResult.rows[0];
    playlist.songs = songsResult.rows;
    return playlist;
  }

  // modified to accept actedBy and record it in activity
  async deleteSongFromPlaylist(playlistId, songId, actedBy) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };
    const result = await pool.query(query);

    if (!result.rows.length) {
      throw new ClientError('Lagu tidak ditemukan dalam playlist', 404);
    }

    // record activity with user who performed delete
    try {
      const actId = `act-${nanoid(16)}`;
      const actQuery = {
        text: `INSERT INTO playlist_song_activities
               (id, playlist_id, song_id, user_id, action)
               VALUES ($1, $2, $3, $4, $5)`,
        values: [actId, playlistId, songId, actedBy, 'delete'],
      };
      await pool.query(actQuery);
    } catch (e) {
      // ignore
    }

    return result.rows[0].id;
  }

  async deletePlaylistById(playlistId) {
    const q = { text: 'DELETE FROM playlists WHERE id = $1 RETURNING id', values: [playlistId] };
    const res = await pool.query(q);
    if (!res.rows.length) {
      throw new ClientError('Playlist gagal dihapus. Id tidak ditemukan', 404);
    }
    return res.rows[0].id;
  }
}

module.exports = PlaylistsService;
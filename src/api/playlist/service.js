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
    if (!result.rows[0]) throw new Error('Gagal membuat playlist');
    return result.rows[0].id;
  }

  async getPlaylistsByUser(userId) {
    // return playlists owned by user (plus owner username)
    const query = {
      text: `SELECT p.id, p.name, u.username
             FROM playlists p
             JOIN users u ON p.owner = u.id
             WHERE p.owner = $1`,
      values: [userId],
    };
    const result = await pool.query(query);
    return result.rows;
  }

  async verifyPlaylistOwner(playlistId, userId) {
    const q = { text: 'SELECT owner FROM playlists WHERE id = $1', values: [playlistId] };
    const res = await pool.query(q);
    if (!res.rows.length) throw new ClientError('Playlist tidak ditemukan', 404);
    if (res.rows[0].owner !== userId) throw new ClientError('Anda tidak berhak mengakses resource ini', 403);
    return true;
  }

  async verifyPlaylistAccess(playlistId, userId) {
    // owner or collaborator (simple owner check implemented here; collaborator check can be added)
    try {
      return await this.verifyPlaylistOwner(playlistId, userId);
    } catch (err) {
      if (err instanceof ClientError && err.statusCode === 403) {
        // check collaborations
        const q = { text: 'SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2', values: [playlistId, userId] };
        const res = await pool.query(q);
        if (!res.rows.length) throw new ClientError('Anda tidak berhak mengakses resource ini', 403);
        return true;
      }
      throw err;
    }
  }

  async addSongToPlaylist(playlistId, songId, addedBy) {
    const id = `ps-${nanoid(16)}`;
    const q = { text: 'INSERT INTO playlistsongs (id, playlist_id, song_id) VALUES ($1, $2, $3) RETURNING id', values: [id, playlistId, songId] };
    const res = await pool.query(q);
    if (!res.rows.length) throw new Error('Gagal menambahkan lagu ke playlist');
    // optionally insert activity
    return res.rows[0].id;
  }

  async getPlaylistWithSongs(playlistId) {
    const qPlaylist = { text: `SELECT p.id, p.name, u.username FROM playlists p JOIN users u ON p.owner = u.id WHERE p.id = $1`, values: [playlistId] };
    const resPlaylist = await pool.query(qPlaylist);
    if (!resPlaylist.rows.length) throw new ClientError('Playlist tidak ditemukan', 404);
    const playlist = resPlaylist.rows[0];

    const qSongs = {
      text: `SELECT s.id, s.title, s.performer
             FROM playlistsongs ps
             JOIN songs s ON ps.song_id = s.id
             WHERE ps.playlist_id = $1`,
      values: [playlistId],
    };
    const resSongs = await pool.query(qSongs);
    playlist.songs = resSongs.rows;
    return playlist;
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const q = { text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id', values: [playlistId, songId] };
    const res = await pool.query(q);
    if (!res.rows.length) throw new ClientError('Lagu gagal dihapus dari playlist. Data tidak ditemukan', 404);
    return res.rows[0].id;
  }
}

module.exports = PlaylistsService;
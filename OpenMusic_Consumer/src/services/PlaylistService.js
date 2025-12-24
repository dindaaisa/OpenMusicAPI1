const { Pool } = require('pg');

class PlaylistService {
  constructor() {
    this._pool = new Pool({
      host: process.env.PGHOST,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      port: Number(process.env.PGPORT || 5432),
    });
  }

  async getPlaylistWithSongs(playlistId) {
    const playlistRes = await this._pool.query(
      'SELECT id, name FROM playlists WHERE id = $1',
      [playlistId]
    );

    if (!playlistRes.rowCount) {
      throw new Error('Playlist tidak ditemukan');
    }

    const songsRes = await this._pool.query(
      `SELECT s.id, s.title, s.performer
       FROM songs s
       JOIN playlistsongs ps ON ps.song_id = s.id
       WHERE ps.playlist_id = $1
       ORDER BY ps.created_at ASC`,
      [playlistId]
    );

    return {
      id: playlistRes.rows[0].id,
      name: playlistRes.rows[0].name,
      songs: songsRes.rows,
    };
  }
}

module.exports = PlaylistService;

const pool = require('../../../validator/pool');
const ClientError = require('../../../exceptions/ClientError');

class PlaylistActivitiesService {
  async verifyPlaylistExists(playlistId) {
    const q = { text: 'SELECT id FROM playlists WHERE id = $1', values: [playlistId] };
    const res = await pool.query(q);
    if (!res.rows.length) throw new ClientError('Playlist tidak ditemukan', 404);
    return true;
  }

  async getActivitiesByPlaylistId(playlistId) {
    // ensure playlist exists
    await this.verifyPlaylistExists(playlistId);

    const q = {
      text: `
        SELECT u.username, s.title, a.action, a.time
        FROM playlist_song_activities a
        LEFT JOIN users u ON a.user_id = u.id
        LEFT JOIN songs s ON a.song_id = s.id
        WHERE a.playlist_id = $1
        ORDER BY a.time ASC
      `,
      values: [playlistId],
    };
    const res = await pool.query(q);
    // map to expected shape
    return res.rows.map((r) => ({
      username: r.username,
      title: r.title,
      action: r.action,
      time: r.time,
    }));
  }
}

module.exports = PlaylistActivitiesService;
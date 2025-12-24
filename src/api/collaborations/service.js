const { nanoid } = require('nanoid');
const pool = require('../../validator/pool');
const ClientError = require('../../exceptions/ClientError');

class CollaborationsService {
  async verifyUserExists(userId) {
    const q = { text: 'SELECT id FROM users WHERE id = $1', values: [userId] };
    const res = await pool.query(q);
    if (!res.rows.length) {
      throw new ClientError('User tidak ditemukan', 404);
    }
    return true;
  }

  async addCollaboration(playlistId, userId) {
    // ensure no duplicate collaboration
    const existQ = { text: 'SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2', values: [playlistId, userId] };
    const existRes = await pool.query(existQ);
    if (existRes.rows.length) {
      throw new ClientError('Kolaborasi sudah ada', 400);
    }

    const id = `collab-${nanoid(16)}`;
    const q = {
      text: 'INSERT INTO collaborations (id, playlist_id, user_id) VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };
    const res = await pool.query(q);
    if (!res.rows.length) {
      throw new ClientError('Gagal menambahkan kolaborasi', 500);
    }
    return res.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const q = { text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id', values: [playlistId, userId] };
    const res = await pool.query(q);
    if (!res.rows.length) {
      throw new ClientError('Kolaborasi tidak ditemukan', 404);
    }
    return res.rows[0].id;
  }
}

module.exports = CollaborationsService;
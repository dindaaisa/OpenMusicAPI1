const { nanoid } = require('nanoid');
const pool = require('../../validator/pool');
const ClientError = require('../../exceptions/ClientError');

class CollaborationsService {
  async verifyUserExists(userId) {
    const query = {
      text: 'SELECT id FROM users WHERE id = $1',
      values: [userId],
    };

    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new ClientError('User tidak ditemukan', 404);
    }
  }

  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO collaborations (id, playlist_id, user_id) VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new ClientError('Kolaborasi gagal ditambahkan', 500);
    }

    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new ClientError('Kolaborasi gagal dihapus', 404);
    }
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new ClientError('Kolaborasi tidak ditemukan', 404);
    }
  }
}

module.exports = CollaborationsService;
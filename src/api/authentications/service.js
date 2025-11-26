const { nanoid } = require('nanoid');
const pool = require('../../validator/pool');
const ClientError = require('../../exceptions/ClientError');

class AuthenticationsService {
  async addToken(token) {
    const id = `auth-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO authentications (id, token) VALUES ($1, $2) RETURNING id',
      values: [id, token],
    };
    const result = await pool.query(query);
    if (!result.rows[0]) throw new Error('Gagal menyimpan refresh token');
    return result.rows[0].id;
  }

  async verifyToken(token) {
    const query = {
      text: 'SELECT id FROM authentications WHERE token = $1',
      values: [token],
    };
    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new ClientError('Refresh token tidak valid', 400);
    }
    return true;
  }

  async deleteToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1 RETURNING id',
      values: [token],
    };
    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new ClientError('Refresh token gagal dihapus. Token tidak ditemukan', 404);
    }
    return result.rows[0].id;
  }
}

module.exports = AuthenticationsService;
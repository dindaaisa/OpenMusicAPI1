const { nanoid } = require('nanoid');
const pool = require('../../validator/pool');
const ClientError = require('../../exceptions/ClientError');

class AuthenticationsService {
  async addToken(token) {
    const id = `auth-${nanoid(16)}`;

    try {
      const query = {
        text: 'INSERT INTO authentications (id, token) VALUES ($1, $2) RETURNING id',
        values: [id, token],
      };

      const result = await pool.query(query);

      if (!result.rows.length) {
        throw new ClientError('Gagal menyimpan refresh token', 500);
      }

      return result.rows[0].id;
    } catch (error) {
      // Kalau token dibuat UNIQUE di DB, duplikasi akan melempar error code 23505 (Postgres)
      if (error && error.code === '23505') {
        throw new ClientError('Refresh token sudah terdaftar', 400);
      }

      // kalau sudah ClientError, lempar lagi
      if (error instanceof ClientError) {
        throw error;
      }

      // error lain (DB down, dll)
      throw new ClientError('Gagal menyimpan refresh token', 500);
    }
  }

  async verifyToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };

    const result = await pool.query(query);

    if (!result.rows.length) {
      throw new ClientError('Refresh token tidak valid', 400);
    }
  }

  async deleteToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1 RETURNING token',
      values: [token],
    };

    const result = await pool.query(query);

    if (!result.rows.length) {
      throw new ClientError('Refresh token gagal dihapus. Token tidak ditemukan', 404);
    }
  }
}

module.exports = AuthenticationsService;

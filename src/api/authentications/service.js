const pool = require('../../validator/pool');
const ClientError = require('../../exceptions/ClientError');

class AuthenticationsService {
  async addRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications (token) VALUES ($1)',
      values: [token],
    };
    await pool.query(query);
  }

  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };

    const result = await pool.query(query);
    if (!result.rowCount) {
      throw new ClientError('Refresh token tidak valid', 400);
    }
  }

  async deleteRefreshToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1 RETURNING token',
      values: [token],
    };

    const result = await pool.query(query);
    if (!result.rowCount) {
      throw new ClientError('Refresh token tidak valid', 400);
    }
  }
}

module.exports = AuthenticationsService;

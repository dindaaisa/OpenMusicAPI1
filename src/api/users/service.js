const { nanoid } = require('nanoid');
const pool = require('../../validator/pool');
const bcrypt = require('bcryptjs');
const ClientError = require('../../exceptions/ClientError');

class UsersService {
  async addUser({ username, password, fullname }) {
    // check unique username
    const queryCheck = {
      text: 'SELECT id FROM users WHERE username = $1',
      values: [username],
    };
    const resCheck = await pool.query(queryCheck);
    if (resCheck.rows.length) {
      throw new ClientError('Username sudah digunakan', 400);
    }

    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: 'INSERT INTO users (id, username, password, fullname) VALUES ($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };

    const result = await pool.query(query);
    if (!result.rows[0]) {
      throw new Error('Gagal menambahkan user');
    }
    return result.rows[0].id;
  }

  async verifyUserCredential(username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };
    const result = await pool.query(query);
    if (!result.rows.length) {
      // KREDENSIAL SALAH => harus Unauthorized (401), bukan Bad Request (400)
      throw new ClientError('Kredensial salah', 401);
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      // KREDENSIAL SALAH => Unauthorized (401)
      throw new ClientError('Kredensial salah', 401);
    }
    return user.id;
  }

  async getUsernameById(userId) {
    const q = { text: 'SELECT username FROM users WHERE id = $1', values: [userId] };
    const res = await pool.query(q);
    if (!res.rows.length) return null;
    return res.rows[0].username;
  }
}

module.exports = UsersService;
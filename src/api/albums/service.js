const { nanoid } = require('nanoid');
const pool = require('../../validator/pool');
const ClientError = require('../../exceptions/ClientError');

class AlbumsService {
  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums (id, name, year) VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await pool.query(query);
    if (!result.rows[0]) {
      throw new Error('Gagal menambahkan album');
    }
    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await pool.query('SELECT id, name, year FROM albums');
    return result.rows;
  }

  async getAlbumById(id) {
    const query = {
      text: `SELECT id, name, year, created_at, updated_at
             FROM albums WHERE id = $1`,
      values: [id],
    };
    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new ClientError('Album tidak ditemukan', 404);
    }
    return result.rows[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: `UPDATE albums
             SET name = $1, year = $2, updated_at = current_timestamp
             WHERE id = $3
             RETURNING id`,
      values: [name, year, id],
    };

    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new ClientError('Gagal memperbarui album. Id tidak ditemukan', 404);
    }
    return result.rows[0].id;
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new ClientError('Album gagal dihapus. Id tidak ditemukan', 404);
    }
    return result.rows[0].id;
  }
}

module.exports = AlbumsService;
const { nanoid } = require('nanoid');
const pool = require('../../validator/pool');
const ClientError = require('../../exceptions/ClientError');

class SongsService {
  async addSong({ title, year, performer, genre = null, duration = null, albumId = null }) {
    const id = `song-${nanoid(16)}`;
    const query = {
      text: `INSERT INTO songs
        (id, title, year, performer, genre, duration, album_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id`,
      values: [id, title, year, performer, genre, duration, albumId],
    };

    const result = await pool.query(query);
    if (!result.rows[0] || !result.rows[0].id) {
      throw new Error('Gagal menambahkan song');
    }
    return result.rows[0].id;
  }

  async getSongs({ title, performer } = {}) {
    let baseQuery = 'SELECT id, title, performer FROM songs';
    const conditions = [];
    const values = [];

    if (title) {
      values.push(`%${title.toLowerCase()}%`);
      conditions.push(`LOWER(title) LIKE $${values.length}`);
    }
    if (performer) {
      values.push(`%${performer.toLowerCase()}%`);
      conditions.push(`LOWER(performer) LIKE $${values.length}`);
    }

    if (conditions.length) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await pool.query({ text: baseQuery, values });
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: `SELECT id, title, year, performer, genre, duration, album_id
             FROM songs WHERE id = $1`,
      values: [id],
    };
    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new ClientError('Lagu tidak ditemukan', 404);
    }
    return result.rows[0];
  }

  async editSongById(id, { title, year, performer, genre = null, duration = null, albumId = null }) {
    const query = {
      text: `UPDATE songs
             SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6, updated_at = current_timestamp
             WHERE id = $7
             RETURNING id`,
      values: [title, year, performer, genre, duration, albumId, id],
    };

    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new ClientError('Gagal memperbarui lagu. Id tidak ditemukan', 404);
    }
    return result.rows[0].id;
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await pool.query(query);
    if (!result.rows.length) {
      throw new ClientError('Lagu gagal dihapus. Id tidak ditemukan', 404);
    }
    return result.rows[0].id;
  }
}

module.exports = SongsService;
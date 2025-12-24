const pool = require('../../validator/pool');
const ClientError = require('../../exceptions/ClientError');

class SongsService {
  async addSong({ title, year, performer, genre, duration, albumId }) {
    const query = {
      text: `
        INSERT INTO songs 
        (id, title, year, performer, genre, duration, album_id)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
        RETURNING id
      `,
      values: [title, year, performer, genre, duration, albumId],
    };

    const result = await pool.query(query);
    return result.rows[0].id;
  }

  async getSongs({ title, performer }) {
    let query = `
      SELECT id, title, performer
      FROM songs
      WHERE 1=1
    `;
    const values = [];

    if (title) {
      values.push(`%${title}%`);
      query += ` AND title ILIKE $${values.length}`;
    }

    if (performer) {
      values.push(`%${performer}%`);
      query += ` AND performer ILIKE $${values.length}`;
    }

    const result = await pool.query({ text: query, values });
    return result.rows;
  }

  async getSongById(id) {
    const result = await pool.query({
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    });

    if (!result.rowCount) {
      throw new ClientError('Lagu tidak ditemukan', 404);
    }

    return result.rows[0];
  }

  async editSongById(id, payload) {
    const result = await pool.query({
      text: `
        UPDATE songs SET
          title = $1,
          year = $2,
          performer = $3,
          genre = $4,
          duration = $5,
          album_id = $6
        WHERE id = $7
        RETURNING id
      `,
      values: [
        payload.title,
        payload.year,
        payload.performer,
        payload.genre,
        payload.duration,
        payload.albumId,
        id,
      ],
    });

    if (!result.rowCount) {
      throw new ClientError('Lagu tidak ditemukan', 404);
    }
  }

  async deleteSongById(id) {
    const result = await pool.query({
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    });

    if (!result.rowCount) {
      throw new ClientError('Lagu tidak ditemukan', 404);
    }
  }
}

module.exports = SongsService;

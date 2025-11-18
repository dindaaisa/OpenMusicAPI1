const { nanoid } = require('nanoid');
const pool = require('../../pool');
const ClientError = require('../../exceptions/ClientError');
const AlbumsHandler = require('./handler'); // to attach handler to service instance

class AlbumsService {
  constructor() {
    this._pool = pool;

    // create handler instance and attach to this service so routes can call it
    this._handler = new AlbumsHandler(this, require('./validator')());
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums(id, name, year) VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0]?.id) {
      throw new Error('Failed to add album');
    }
    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT id, name, year FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new ClientError('Album tidak ditemukan', 404);
    }

    const album = result.rows[0];

    // optional: fetch songs in the album (for optional criterion)
    const songsQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };
    const songsResult = await this._pool.query(songsQuery);
    const songs = songsResult.rows;

    return {
      id: album.id,
      name: album.name,
      year: album.year,
      songs,
    };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new ClientError('Gagal memperbarui album. Id tidak ditemukan', 404);
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new ClientError('Album gagal dihapus. Id tidak ditemukan', 404);
    }
  }
}

module.exports = AlbumsService;
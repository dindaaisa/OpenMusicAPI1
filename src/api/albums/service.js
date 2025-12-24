class AlbumsService {
  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const result = await pool.query(
      'INSERT INTO albums (id, name, year) VALUES ($1, $2, $3) RETURNING id',
      [id, name, year]
    );

    if (!result.rowCount) {
      throw new ClientError('Gagal menambahkan album', 500);
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const albumResult = await pool.query(
      'SELECT id, name, year, cover_url FROM albums WHERE id = $1',
      [id]
    );

    if (!albumResult.rowCount) {
      throw new ClientError('Album tidak ditemukan', 404);
    }

    const songsResult = await pool.query(
      'SELECT id, title, performer FROM songs WHERE album_id = $1',
      [id]
    );

    const album = albumResult.rows[0];
    return {
      id: album.id,
      name: album.name,
      year: album.year,
      coverUrl: album.cover_url,
      songs: songsResult.rows,
    };
  }

  async editAlbumById(id, { name, year }) {
    const result = await pool.query(
      'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      [name, year, id]
    );

    if (!result.rowCount) {
      throw new ClientError('Album tidak ditemukan', 404);
    }
  }

  async deleteAlbumById(id) {
    const result = await pool.query(
      'DELETE FROM albums WHERE id = $1 RETURNING id',
      [id]
    );

    if (!result.rowCount) {
      throw new ClientError('Album tidak ditemukan', 404);
    }
  }

  async updateCoverUrl(id, coverUrl) {
    const result = await pool.query(
      'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
      [coverUrl, id]
    );

    if (!result.rowCount) {
      throw new ClientError('Album tidak ditemukan', 404);
    }
  }
}

module.exports = AlbumsService;

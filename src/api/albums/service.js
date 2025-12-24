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

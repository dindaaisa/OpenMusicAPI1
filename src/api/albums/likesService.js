const { nanoid } = require('nanoid');
const pool = require('../../validator/pool');

class AlbumLikesService {
  async addLike({ userId, albumId }) {
    // pastikan album ada
    const albumRes = await pool.query({ text: 'SELECT id FROM albums WHERE id = $1', values: [albumId] });
    if (albumRes.rowCount === 0) {
      const err = new Error('Album tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    // cek sudah like?
    const exists = await pool.query({
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    });
    if (exists.rowCount > 0) {
      const err = new Error('Anda sudah menyukai album ini');
      err.statusCode = 400;
      throw err;
    }

    const id = `like-${nanoid(16)}`;
    await pool.query({
      text: 'INSERT INTO user_album_likes (id, user_id, album_id) VALUES ($1, $2, $3)',
      values: [id, userId, albumId],
    });
  }

  async removeLike({ userId, albumId }) {
    await pool.query({
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    });
  }

  async getLikesCount(albumId) {
    const res = await pool.query({
      text: 'SELECT COUNT(*)::int AS cnt FROM user_album_likes WHERE album_id = $1',
      values: [albumId],
    });
    return res.rows[0].cnt;
  }

  async isLikedByUser({ userId, albumId }) {
    const res = await pool.query({
      text: 'SELECT 1 FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    });
    return res.rowCount > 0;
  }
}

module.exports = AlbumLikesService;
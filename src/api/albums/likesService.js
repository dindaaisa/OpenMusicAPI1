const { nanoid } = require('nanoid');
const pool = require('../../validator/pool');
const ClientError = require('../../exceptions/ClientError');

class AlbumLikesService {
  async addLike({ userId, albumId }) {
    // Pastikan album ada
    const albumRes = await pool.query({
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [albumId],
    });
    
    if (albumRes.rowCount === 0) {
      throw new ClientError('Album tidak ditemukan', 404);
    }

    // Cek sudah like?
    const exists = await pool.query({
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    });
    
    if (exists.rowCount > 0) {
      throw new ClientError('Anda sudah menyukai album ini', 400);
    }

    const id = `like-${nanoid(16)}`;
    await pool.query({
      text: 'INSERT INTO user_album_likes (id, user_id, album_id) VALUES ($1, $2, $3)',
      values: [id, userId, albumId],
    });
  }

  async removeLike({ userId, albumId }) {
    const result = await pool.query({
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    });

    if (result.rowCount === 0) {
      throw new ClientError('Like tidak ditemukan', 404);
    }
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
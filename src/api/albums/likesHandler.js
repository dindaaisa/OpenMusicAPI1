class LikesHandler {
  constructor({ albumLikesService, cacheService }) {
    this._albumLikesService = albumLikesService;
    this._cacheService = cacheService;

    this.postLike = this.postLike.bind(this);
    this.deleteLike = this.deleteLike.bind(this);
    this.getLikes = this.getLikes.bind(this);
  }

  async postLike(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._albumLikesService.addLike({ userId, albumId });
    await this._cacheService.del(`album:${albumId}:likes`);

    return h.response({
      status: 'success',
      message: 'Sukses menyukai album',
    }).code(201);
  }

  async deleteLike(request) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._albumLikesService.removeLike({ userId, albumId });
    await this._cacheService.del(`album:${albumId}:likes`);

    return {
      status: 'success',
      message: 'Berhasil membatalkan like',
    };
  }

  async getLikes(request, h) {
    const { id: albumId } = request.params;
    const cacheKey = `album:${albumId}:likes`;

    const cached = await this._cacheService.get(cacheKey);
    if (cached !== null) {
      const res = h.response({
        status: 'success',
        data: { likes: Number(cached) },
      });
      res.header('X-Data-Source', 'cache');
      return res;
    }

    const count = await this._albumLikesService.getLikesCount(albumId);
    await this._cacheService.set(cacheKey, String(count));

    return {
      status: 'success',
      data: { likes: count },
    };
  }
}

module.exports = LikesHandler;

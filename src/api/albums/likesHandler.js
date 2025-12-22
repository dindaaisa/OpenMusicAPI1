class LikesHandler {
    constructor({ albumLikesService, cacheService }) {
      this._albumLikesService = albumLikesService;
      this._cacheService = cacheService; // optional, boleh null
      this.postLike = this.postLike.bind(this);
      this.deleteLike = this.deleteLike.bind(this);
      this.getLikes = this.getLikes.bind(this);
    }
  
    async postLike(request, h) {
      const albumId = request.params.id;
      const userId = request.auth.credentials.id;
  
      await this._albumLikesService.addLike({ userId, albumId });
  
      if (this._cacheService) await this._cacheService.del(`album:${albumId}:likes`);
  
      return h.response({ status: 'success', message: 'Sukses menyukai album' }).code(201);
    }
  
    async deleteLike(request, h) {
      const albumId = request.params.id;
      const userId = request.auth.credentials.id;
  
      await this._albumLikesService.removeLike({ userId, albumId });
  
      if (this._cacheService) await this._cacheService.del(`album:${albumId}:likes`);
  
      return h.response({ status: 'success', message: 'Berhasil membatalkan like' });
    }
  
    async getLikes(request, h) {
      const albumId = request.params.id;
      const cacheKey = `album:${albumId}:likes`;
      if (this._cacheService) {
        const cached = await this._cacheService.get(cacheKey);
        if (cached !== null && typeof cached !== 'undefined') {
          const res = h.response({ status: 'success', data: { likes: Number(cached) } });
          res.header('X-Data-Source', 'cache');
          return res;
        }
      }
  
      const count = await this._albumLikesService.getLikesCount(albumId);
  
      if (this._cacheService) await this._cacheService.set(cacheKey, String(count), 1800);
  
      return h.response({ status: 'success', data: { likes: count } });
    }
  }
  
  module.exports = LikesHandler;
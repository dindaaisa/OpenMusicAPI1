const routes = (handler, coverHandler, likesHandler) => [
  // create album
  {
    method: 'POST',
    path: '/albums',
    handler: handler.postAlbumHandler,
    options: {
      auth: false,
    },
  },

  // get album by id
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: handler.getAlbumByIdHandler,
    options: {
      auth: false,
    },
  },

  // update album
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: handler.putAlbumByIdHandler,
    options: {
      auth: false,
    },
  },

  // delete album
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: handler.deleteAlbumByIdHandler,
    options: {
      auth: false,
    },
  },

  // upload cover (multipart/form-data, expects field 'cover')
  {
    method: 'POST',
    path: '/albums/{id}/covers',
    handler: coverHandler.postCoverHandler,
    options: {
      auth: 'openmusic_jwt',
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: 512000, // 500KB
      },
    },
  },

  // likes: add like
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: likesHandler.postLike,
    options: {
      auth: 'openmusic_jwt',
    },
  },

  // likes: remove like
  {
    method: 'DELETE',
    path: '/albums/{id}/likes',
    handler: likesHandler.deleteLike,
    options: {
      auth: 'openmusic_jwt',
    },
  },

  // likes: get likes count
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: likesHandler.getLikes,
    options: {
      auth: false,
    },
  },
];

module.exports = routes;
const routes = (handler, coverHandler, likesHandler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: handler.postAlbumHandler,
    options: { auth: false },
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: handler.getAlbumByIdHandler,
    options: { auth: false },
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: handler.putAlbumByIdHandler,
    options: { auth: false },
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: handler.deleteAlbumByIdHandler,
    options: { auth: false },
  },
  {
    method: 'POST',
    path: '/albums/{id}/covers',
    handler: coverHandler.postCoverHandler,
    options: {
      auth: false,
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: 512000,
      },
    },
  },
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: likesHandler.postLike,
    options: { auth: 'openmusic_jwt' },
  },
  {
    method: 'DELETE',
    path: '/albums/{id}/likes',
    handler: likesHandler.deleteLike,
    options: { auth: 'openmusic_jwt' },
  },
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: likesHandler.getLikes,
    options: { auth: false },
  },
];

module.exports = routes;

const routes = (service, validator) => [
    {
      method: 'POST',
      path: '/albums',
      handler: (request, h) => service._handler.postAlbumHandler(request, h),
      options: {},
    },
    {
      method: 'GET',
      path: '/albums/{id}',
      handler: (request, h) => service._handler.getAlbumByIdHandler(request, h),
      options: {},
    },
    {
      method: 'PUT',
      path: '/albums/{id}',
      handler: (request, h) => service._handler.putAlbumByIdHandler(request, h),
    },
    {
      method: 'DELETE',
      path: '/albums/{id}',
      handler: (request, h) => service._handler.deleteAlbumByIdHandler(request, h),
    },
  ];
  
  module.exports = routes;
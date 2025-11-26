const routes = (handler) => [
    {
      method: 'POST',
      path: '/playlists',
      handler: handler.postPlaylistHandler,
    },
    {
      method: 'GET',
      path: '/playlists',
      handler: handler.getPlaylistsHandler,
    },
    {
      method: 'POST',
      path: '/playlists/{id}/songs',
      handler: handler.postPlaylistSongHandler,
    },
    {
      method: 'GET',
      path: '/playlists/{id}/songs',
      handler: handler.getPlaylistSongsHandler,
    },
    {
      method: 'DELETE',
      path: '/playlists/{id}/songs',
      handler: handler.deletePlaylistSongHandler,
    },
  ];
  
  module.exports = routes;
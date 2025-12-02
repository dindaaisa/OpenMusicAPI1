const PlaylistActivitiesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlist-activities',
  version: '1.0.0',
  register: async (server, { service, playlistsService }) => {
    const handler = new PlaylistActivitiesHandler(service, playlistsService);
    server.route(routes(handler));
  },
};
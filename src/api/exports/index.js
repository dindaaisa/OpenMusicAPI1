const routes = require('./routes');
const Handler = require('./handler');

module.exports = {
    name: 'exports',
    register: async (server, { service, playlistsService, validator }) => {
      const handler = new Handler(service, validator, playlistsService);
      server.route(routes(handler));
    },
  };
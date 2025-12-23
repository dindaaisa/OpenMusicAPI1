const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { service, validator, coverHandler, likesHandler }) => {
    const handler = new AlbumsHandler(service, validator);

    // Wajib di-inject dari server.js
    // - coverHandler: untuk POST /albums/{id}/covers
    // - likesHandler: untuk /albums/{id}/likes
    server.route(routes(handler, coverHandler, likesHandler));
  },
};

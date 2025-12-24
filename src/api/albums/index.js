const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { service, validator, coverHandler, likesHandler }) => {
    const handler = new AlbumsHandler(service, validator);
    
    // coverHandler dan likesHandler wajib di-inject dari server.js
    if (!coverHandler) {
      throw new Error('coverHandler is required for albums plugin');
    }
    if (!likesHandler) {
      throw new Error('likesHandler is required for albums plugin');
    }
    
    server.route(routes(handler, coverHandler, likesHandler));
  },
};
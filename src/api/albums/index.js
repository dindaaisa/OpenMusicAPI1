const AlbumsHandler = require('./handler');
const albumsRoutes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  /**
   * register(server, options)
   * options expected:
   *   - service: instance of AlbumsService
   *   - validator: instance validator
   *   - albumLikesService: instance of AlbumLikesService (optional)
   *   - coverHandler: instance of CoverHandler (optional)
   *   - likesHandler: instance of LikesHandler (optional)
   */
  register: async (server, options) => {
    const { service, validator, albumLikesService, coverHandler, likesHandler } = options;

    // existing albums handler (uses existing constructor signature)
    const handler = new AlbumsHandler(service, validator);

    // If coverHandler/likesHandler are not provided, try to create thin adapters
    // (but prefer server to inject concrete instances)
    if (!coverHandler) {
      // fallback: create a minimal coverHandler adapter that throws helpful error
      // so developers know to wire in the real cover handler
      const missing = {
        postCoverHandler: async () => {
          throw new Error('Cover handler not wired. Please inject coverHandler in plugin options.');
        },
      };
      server.route(albumsRoutes(handler, missing, missing));
      return;
    }

    // likesHandler must be provided (or an adapter)
    if (!likesHandler) {
      const missingLikes = {
        postLike: async () => {
          throw new Error('Likes handler not wired. Please inject likesHandler in plugin options.');
        },
        deleteLike: async () => {
          throw new Error('Likes handler not wired. Please inject likesHandler in plugin options.');
        },
        getLikes: async () => {
          throw new Error('Likes handler not wired. Please inject likesHandler in plugin options.');
        },
      };
      server.route(albumsRoutes(handler, coverHandler, missingLikes));
      return;
    }

    // register routes with the provided handlers
    server.route(albumsRoutes(handler, coverHandler, likesHandler));
  },
};
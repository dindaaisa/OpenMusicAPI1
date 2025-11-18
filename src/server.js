require('dotenv').config();
const Hapi = require('@hapi/hapi');

const ClientError = require('./exceptions/ClientError');

const AlbumsPlugin = require('./api/albums');
const AlbumsService = require('./api/albums/service');
const AlbumsValidator = require('./api/albums/validator');

const SongsPlugin = require('./api/songs');
const SongsService = require('./api/songs/service');
const SongsValidator = require('./api/songs/validator');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    routes: { cors: { origin: ['*'] } },
  });

  // instantiate services & validators
  const albumsService = new AlbumsService();
  const albumsValidator = new AlbumsValidator();

  const songsService = new SongsService();
  const songsValidator = new SongsValidator();

  // register plugins with injected service & validator
  await server.register([
    {
      plugin: AlbumsPlugin,
      options: {
        service: albumsService,
        validator: albumsValidator,
      },
    },
    {
      plugin: SongsPlugin,
      options: {
        service: songsService,
        validator: songsValidator,
      },
    },
  ]);

  // global error handler
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        // let hapi handle (404, etc.)
        return h.continue;
      }

      // server error
      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      newResponse.code(500);
      console.error(response);
      return newResponse;
    }

    return h.continue;
  });

  // health route
  server.route({
    method: 'GET',
    path: '/',
    handler: () => ({ status: 'success', message: 'OpenMusic API (v1) running' }),
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();
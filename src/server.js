require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('jsonwebtoken');
const Path = require('path');

const ClientError = require('../exceptions/ClientError');

// plugins & services
const AlbumsPlugin = require('./api/albums');
const AlbumsService = require('./api/albums/service');
const AlbumsValidator = require('./api/albums/validator');

const UsersPlugin = require('./api/users');
const UsersService = require('./api/users/service');
const UsersValidator = require('./api/users/validator');

const AlbumLikesService = require('./api/albums/likesService');
const LikesHandler = require('./api/albums/likesHandler');
const CacheService = require('./services/cacheService');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    routes: { cors: { origin: ['*'] } },
  });

  await server.register(require('@hapi/inert'));

  server.route({
    method: 'GET',
    path: '/uploads/{param*}',
    handler: {
      directory: {
        path: Path.resolve(__dirname, 'uploads'),
        index: false,
      },
    },
    options: { auth: false },
  });

  // auth
  server.auth.scheme('openmusic_jwt', () => ({
    authenticate: (request, h) => {
      const authorization = request.headers.authorization;
      if (!authorization) throw new ClientError('Missing authentication', 401);

      const [type, token] = authorization.split(' ');
      if (type !== 'Bearer') throw new ClientError('Invalid auth format', 401);

      try {
        const decoded = Jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
        return h.authenticated({ credentials: { id: decoded.userId } });
      } catch {
        throw new ClientError('Invalid token', 401);
      }
    },
  }));

  server.auth.strategy('openmusic_jwt', 'openmusic_jwt');

  // services
  const albumsService = new AlbumsService();
  const albumsValidator = new AlbumsValidator();

  const albumLikesService = new AlbumLikesService();
  const cacheService = new CacheService();
  const likesHandler = new LikesHandler({ albumLikesService, cacheService });

  await server.register([
    {
      plugin: AlbumsPlugin,
      options: { service: albumsService, validator: albumsValidator, likesHandler },
    },
    {
      plugin: UsersPlugin,
      options: { service: new UsersService(), validator: new UsersValidator() },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    if (response instanceof ClientError) {
      return h.response({ status: 'fail', message: response.message }).code(response.statusCode);
    }
    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();

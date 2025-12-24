require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('jsonwebtoken');
const Path = require('path');
const ClientError = require('./exceptions/ClientError');

/* PLUGINS */
const AlbumsPlugin = require('./api/albums');
const SongsPlugin = require('./api/songs');
const UsersPlugin = require('./api/users');
const AuthenticationsPlugin = require('./api/authentications');
const PlaylistsPlugin = require('./api/playlist');
const PlaylistActivitiesPlugin = require('./api/playlist/activities');
const CollaborationsPlugin = require('./api/collaborations');
const ExportsPlugin = require('./api/exports');

/* SERVICES */
const AlbumsService = require('./api/albums/service');
const SongsService = require('./api/songs/service');
const UsersService = require('./api/users/service');
const AuthenticationsService = require('./api/authentications/service');
const PlaylistsService = require('./api/playlist/service');
const PlaylistActivitiesService = require('./api/playlist/activities/service');
const CollaborationsService = require('./api/collaborations/service');
const ProducerService = require('./services/rabbitmq/ProducerService');
const CacheService = require('./services/cacheService');

/* VALIDATORS */
const AlbumsValidator = require('./api/albums/validator');
const SongsValidator = require('./api/songs/validator');
const UsersValidator = require('./api/users/validator');
const AuthenticationsValidator = require('./api/authentications/validator');
const PlaylistsValidator = require('./api/playlist/validator');
const CollaborationsValidator = require('./api/collaborations/validator');
const ExportsValidator = require('./api/exports/validator');

/* OTHERS */
const TokenManager = require('./api/authentications/tokenManager');
const CoverHandler = require('./api/albums/coverHandler');
const AlbumLikesService = require('./api/albums/likesService');
const LikesHandler = require('./api/albums/likesHandler');

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
      },
    },
    options: { auth: false },
  });

  /* JWT */
  server.auth.scheme('openmusic_jwt', () => ({
    authenticate: (request, h) => {
      const auth = request.headers.authorization;
      if (!auth) throw new ClientError('Missing authentication', 401);

      const [type, token] = auth.split(' ');
      if (type !== 'Bearer') throw new ClientError('Invalid auth format', 401);

      try {
        const decoded = Jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
        return h.authenticated({ credentials: { id: decoded.userId } });
      } catch (error) {
        throw new ClientError('Invalid token', 401);
      }
    },
  }));

  server.auth.strategy('openmusic_jwt', 'openmusic_jwt');
  server.auth.default('openmusic_jwt');

  /* INIT SERVICES */
  const cacheService = new CacheService();
  const albumsService = new AlbumsService();
  const albumLikesService = new AlbumLikesService(cacheService);

  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();

  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistActivitiesService = new PlaylistActivitiesService();
  const songsService = new SongsService();

  const producerService = new ProducerService(process.env.RABBITMQ_SERVER);

  /* REGISTER */
  await server.register([
    {
      plugin: AuthenticationsPlugin,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: new AuthenticationsValidator(),
      },
    },
    {
      plugin: UsersPlugin,
      options: {
        service: usersService,
        validator: new UsersValidator(),
      },
    },
    {
      plugin: AlbumsPlugin,
      options: {
        service: albumsService,
        validator: new AlbumsValidator(),
        coverHandler: new CoverHandler({ albumService: albumsService }),
        likesHandler: new LikesHandler({ albumLikesService, cacheService }),
      },
    },
    {
      plugin: SongsPlugin,
      options: {
        service: new SongsService(),
        validator: new SongsValidator(),
      },
    },
    {
      plugin: CollaborationsPlugin,
      options: {
        service: collaborationsService,
        playlistsService,
        usersService,
        validator: new CollaborationsValidator(),
      },
    },
    {
      plugin: PlaylistsPlugin,
      options: {
        service: playlistsService,
        songsService,
        validator: new PlaylistsValidator(),
      },
    },
    {
      plugin: PlaylistActivitiesPlugin,
      options: {
        service: playlistActivitiesService,
        playlistsService,
      },
    },
    {
      plugin: ExportsPlugin,
      options: {
        service: producerService,
        playlistsService,
        validator: new ExportsValidator(),
      },
    },
  ]);

  /* ERROR HANDLER */
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      return h.response({
        status: 'fail',
        message: response.message,
      }).code(response.statusCode);
    }

    if (response.isBoom) {
      const statusCode = response.output.statusCode;
      return h.response({
        status: statusCode < 500 ? 'fail' : 'error',
        message: response.output.payload.message,
      }).code(statusCode);
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan di ${server.info.uri}`);
};

init();

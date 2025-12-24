require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('jsonwebtoken');
const Path = require('path');
const ClientError = require('./exceptions/ClientError');

/* =======================
   PLUGINS
======================= */
const AlbumsPlugin = require('./api/albums');
const SongsPlugin = require('./api/songs');
const UsersPlugin = require('./api/users');
const AuthenticationsPlugin = require('./api/authentications');
const PlaylistsPlugin = require('./api/playlist');
const CollaborationsPlugin = require('./api/collaborations');
const ExportsPlugin = require('./api/exports');

/* =======================
   SERVICES
======================= */
const AlbumsService = require('./api/albums/service');
const SongsService = require('./api/songs/service');
const UsersService = require('./api/users/service');
const AuthenticationsService = require('./api/authentications/service');
const PlaylistsService = require('./api/playlist/service');
const CollaborationsService = require('./api/collaborations/service');
const ProducerService = require('./services/rabbitmq/ProducerService');
const CacheService = require('./services/cacheService');
const AlbumLikesService = require('./api/albums/likesService');

/* =======================
   VALIDATORS
======================= */
const AlbumsValidator = require('./api/albums/validator');
const SongsValidator = require('./api/songs/validator');
const UsersValidator = require('./api/users/validator');
const AuthenticationsValidator = require('./api/authentications/validator');
const PlaylistsValidator = require('./api/playlist/validator');
const CollaborationsValidator = require('./api/collaborations/validator');
const ExportsValidator = require('./api/exports/validator');

/* =======================
   HANDLERS
======================= */
const TokenManager = require('./api/authentications/tokenManager');
const CoverHandler = require('./api/albums/coverHandler');
const LikesHandler = require('./api/albums/likesHandler');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    routes: { 
      cors: { origin: ['*'] },
      payload: {
        maxBytes: 512000, // 512KB default
      }
    },
  });

  /* =======================
     REGISTER INERT (Static Files)
  ======================= */
  await server.register(require('@hapi/inert'));

  /* =======================
     STATIC FILES ROUTE
  ======================= */
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

  /* =======================
     JWT AUTH SCHEME
  ======================= */
  server.auth.scheme('openmusic_jwt', () => ({
    authenticate: (request, h) => {
      const authorization = request.headers.authorization;
      if (!authorization) {
        throw new ClientError('Missing authentication', 401);
      }

      const [type, token] = authorization.split(' ');
      if (type !== 'Bearer') {
        throw new ClientError('Invalid auth format', 401);
      }

      try {
        const decoded = Jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
        return h.authenticated({
          credentials: { id: decoded.userId },
        });
      } catch (error) {
        throw new ClientError('Invalid token', 401);
      }
    },
  }));

  server.auth.strategy('openmusic_jwt', 'openmusic_jwt');

  /* =======================
     INITIALIZE SERVICES
  ======================= */
  console.log('🔧 Initializing services...');
  const cacheService = new CacheService();
  const albumsService = new AlbumsService();
  const albumLikesService = new AlbumLikesService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const producerService = new ProducerService();
  console.log('✅ Services initialized');

  /* =======================
     INITIALIZE HANDLERS
  ======================= */
  console.log('🔧 Initializing handlers...');
  const coverHandler = new CoverHandler({ albumService: albumsService });
  const likesHandler = new LikesHandler({ 
    albumLikesService, 
    cacheService 
  });
  console.log('✅ Handlers initialized');

  /* =======================
     REGISTER PLUGINS
  ======================= */
  console.log('🔧 Registering plugins...');
  await server.register([
    // Users & Authentication
    {
      plugin: UsersPlugin,
      options: { 
        service: usersService, 
        validator: new UsersValidator() 
      },
    },
    {
      plugin: AuthenticationsPlugin,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: new AuthenticationsValidator(),
      },
    },
    // Albums & Songs
    {
      plugin: AlbumsPlugin,
      options: {
        service: albumsService,
        validator: new AlbumsValidator(),
        coverHandler,
        likesHandler,
      },
    },
    {
      plugin: SongsPlugin,
      options: { 
        service: songsService, 
        validator: new SongsValidator() 
      },
    },
    // Collaborations & Playlists
    {
      plugin: CollaborationsPlugin,
      options: {
        collaborationsService,
        playlistsService,
        validator: new CollaborationsValidator(),
      },
    },
    {
      plugin: PlaylistsPlugin,
      options: {
        service: playlistsService,
        validator: new PlaylistsValidator(),
      },
    },
    // Exports
    {
      plugin: ExportsPlugin,
      options: {
        producerService,
        playlistsService,
        validator: new ExportsValidator(),
      },
    },
  ]);
  console.log('✅ Plugins registered');

  /* =======================
     GLOBAL ERROR HANDLER
  ======================= */
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      return h.response({
        status: 'fail',
        message: response.message,
      }).code(response.statusCode);
    }

    if (response.isBoom) {
      const { statusCode } = response.output;
      
      // Handle payload too large
      if (statusCode === 413) {
        return h.response({
          status: 'fail',
          message: 'Payload content length greater than maximum allowed: 512000',
        }).code(413);
      }

      // Handle unauthorized
      if (statusCode === 401) {
        return h.response({
          status: 'fail',
          message: response.message || 'Unauthorized',
        }).code(401);
      }

      // Client errors (4xx)
      if (statusCode >= 400 && statusCode < 500) {
        return h.response({
          status: 'fail',
          message: response.output.payload.message || response.message,
        }).code(statusCode);
      }

      // Server errors (5xx)
      console.error(response);
      return h.response({
        status: 'error',
        message: 'Terjadi kegagalan pada server kami',
      }).code(500);
    }

    return h.continue;
  });

  /* =======================
     START SERVER
  ======================= */
  await server.start();
  console.log(`✅ Server berjalan di ${server.info.uri}`);
};

init().catch((err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});
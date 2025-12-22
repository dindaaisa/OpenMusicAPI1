require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('jsonwebtoken');
const Path = require('path');

const ClientError = require('./exceptions/ClientError');

// V1 plugins
const AlbumsPlugin = require('./api/albums');
const AlbumsService = require('./api/albums/service');
const AlbumsValidator = require('./api/albums/validator');

const SongsPlugin = require('./api/songs');
const SongsService = require('./api/songs/service');
const SongsValidator = require('./api/songs/validator');

// V2 plugins
const UsersPlugin = require('./api/users');
const UsersService = require('./api/users/service');
const UsersValidator = require('./api/users/validator');

const AuthenticationsPlugin = require('./api/authentications');
const AuthenticationsService = require('./api/authentications/service');
const AuthenticationsValidator = require('./api/authentications/validator');
const TokenManager = require('./api/authentications/tokenManager');

// Playlists (singular folder in your repo)
const PlaylistsPlugin = require('./api/playlist');
const PlaylistsService = require('./api/playlist/service');
const PlaylistsValidator = require('./api/playlist/validator');

// Collaborations
const CollaborationsPlugin = require('./api/collaborations');
const CollaborationsService = require('./api/collaborations/service');
const CollaborationsValidator = require('./api/collaborations/validator');

// Playlist activities
const PlaylistActivitiesPlugin = require('./api/playlist/activities');
const PlaylistActivitiesService = require('./api/playlist/activities/service');

// New album-related helpers (make sure these files exist)
const AlbumLikesService = require('./api/albums/likesService'); // new
const CoverHandler = require('./api/albums/coverHandler'); // new
const LikesHandler = require('./api/albums/likesHandler'); // new

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // register inert to serve uploads static files
  await server.register(require('@hapi/inert'));

  // static route for uploads (serve files from ./uploads)
  server.route({
    method: 'GET',
    path: '/uploads/{param*}',
    handler: {
      directory: {
        path: Path.resolve(__dirname, 'uploads'),
        redirectToSlash: false,
        index: false,
      },
    },
    options: { auth: false },
  });

  // instantiate services & validators
  const albumsService = new AlbumsService();
  const albumsValidator = new AlbumsValidator();

  const songsService = new SongsService();
  const songsValidator = new SongsValidator();

  const usersService = new UsersService();
  const usersValidator = new UsersValidator();

  const authenticationsService = new AuthenticationsService();
  const authenticationsValidator = new AuthenticationsValidator();
  const tokenManager = TokenManager;

  const playlistsService = new PlaylistsService();
  const playlistsValidator = new PlaylistsValidator();

  const collaborationsService = new CollaborationsService();
  const collaborationsValidator = new CollaborationsValidator();

  const playlistActivitiesService = new PlaylistActivitiesService();

  // new album likes / handlers
  const albumLikesService = new AlbumLikesService(); // ensure this file uses DB pool
  const coverHandler = new CoverHandler({ albumService: albumsService });
  const likesHandler = new LikesHandler({ albumLikesService: albumLikesService });

  // Register auth scheme BEFORE routes/plugins are registered
  server.auth.scheme('openmusic_jwt', () => {
    return {
      authenticate: (request, h) => {
        const authorization = request.headers.authorization;
        // debug helpers
        console.log('[auth] Authorization header:', authorization);

        if (!authorization) {
          throw new ClientError('Missing authentication', 401);
        }

        const parts = authorization.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
          throw new ClientError('Invalid authentication format', 401);
        }

        const accessToken = parts[1];

        try {
          const decoded = Jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY);
          console.log('[auth] decoded token:', decoded);
          if (!decoded || !decoded.userId) {
            throw new ClientError('Invalid access token payload', 401);
          }
          return h.authenticated({ credentials: { id: decoded.userId } });
        } catch (err) {
          console.log('[auth] token verify error:', err && err.message);
          throw new ClientError('Invalid or expired token', 401);
        }
      },
    };
  });

  server.auth.strategy('openmusic_jwt', 'openmusic_jwt');

  // register plugins (injecting services & validators)
  await server.register([
    {
      plugin: AlbumsPlugin,
      options: {
        service: albumsService,
        validator: albumsValidator,
        albumLikesService, // pass likes service instance
        coverHandler, // pass cover handler instance
        likesHandler, // pass likes handler instance
      },
    },
    {
      plugin: SongsPlugin,
      options: {
        service: songsService,
        validator: songsValidator,
      },
    },
    {
      plugin: UsersPlugin,
      options: {
        service: usersService,
        validator: usersValidator,
      },
    },
    {
      plugin: AuthenticationsPlugin,
      options: {
        authenticationsService,
        usersService,
        tokenManager,
        validator: authenticationsValidator,
      },
    },
    {
      plugin: PlaylistsPlugin,
      options: {
        service: playlistsService,
        validator: playlistsValidator,
        songsService, // inject songsService so playlists can verify song existence
      },
    },
    {
      plugin: CollaborationsPlugin,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: collaborationsValidator,
      },
    },
    {
      plugin: PlaylistActivitiesPlugin,
      options: {
        service: playlistActivitiesService,
        playlistsService,
      },
    },
  ]);

  // global error handler via onPreResponse
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
        return h.continue;
      }

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

  // Health route (public)
  server.route({
    method: 'GET',
    path: '/',
    options: { auth: false },
    handler: () => ({ status: 'success', message: 'OpenMusic API running' }),
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();
const ClientError = require('../../exceptions/ClientError');

class PlaylistsHandler {
  constructor(service, validator, songsService) {
    this._service = service;
    this._validator = validator;
    this._songsService = songsService;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistSongsHandler = this.getPlaylistSongsHandler.bind(this);
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
  }

  // helper: safely get authenticated user id or throw 401
  _getAuthenticatedUserId(request) {
    const auth = request.auth && request.auth.credentials;
    if (!auth || !auth.id) {
      throw new ClientError('Missing authentication', 401);
    }
    return auth.id;
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;

    // safe get credential id
    const credentialId = this._getAuthenticatedUserId(request);

    const playlistId = await this._service.addPlaylist({ name, owner: credentialId });

    const response = h.response({
      status: 'success',
      data: { playlistId },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    // safe get credential id
    const credentialId = this._getAuthenticatedUserId(request);

    const playlists = await this._service.getPlaylistsByUser(credentialId);
    return {
      status: 'success',
      data: { playlists },
    };
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { songId } = request.payload;
    const playlistId = request.params.id;

    // safe get credential id and verify existence
    const credentialId = this._getAuthenticatedUserId(request);

    // verify song exists (throws if not)
    await this._songsService.getSongById(songId);

    // verify access (owner or collaborator) — service should throw if not allowed
    await this._service.verifyPlaylistAccess(playlistId, credentialId);

    await this._service.addSongToPlaylist(playlistId, songId, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsHandler(request) {
    const playlistId = request.params.id;
    const credentialId = this._getAuthenticatedUserId(request);

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this._service.getPlaylistWithSongs(playlistId);

    return {
      status: 'success',
      data: { playlist },
    };
  }

  async deletePlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { songId } = request.payload;
    const playlistId = request.params.id;

    const credentialId = this._getAuthenticatedUserId(request);

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.deleteSongFromPlaylist(playlistId, songId);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistsHandler;
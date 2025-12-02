const ClientError = require('../../../exceptions/ClientError');

class PlaylistActivitiesHandler {
  constructor(service, playlistsService) {
    this._service = service;
    this._playlistsService = playlistsService;

    this.getPlaylistActivitiesHandler = this.getPlaylistActivitiesHandler.bind(this);
  }

  _getAuthenticatedUserId(request) {
    const auth = request.auth && request.auth.credentials;
    if (!auth || !auth.id) {
      throw new ClientError('Missing authentication', 401);
    }
    return auth.id;
  }

  async getPlaylistActivitiesHandler(request, h) {
    const { id: playlistId } = request.params;
    const credentialId = this._getAuthenticatedUserId(request);

    // verify access (owner or collaborator)
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const activities = await this._service.getActivitiesByPlaylistId(playlistId);

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = PlaylistActivitiesHandler;
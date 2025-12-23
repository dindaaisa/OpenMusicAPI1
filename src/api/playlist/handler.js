const ClientError = require('../../exceptions/ClientError');
const RabbitMQProducer = require('../producer/rabbitmqProducer'); // Mengimpor RabbitMQProducer

class PlaylistsHandler {
  constructor(service, validator, songsService) {
    this._service = service;
    this._validator = validator;
    this._songsService = songsService;

    // Bind all handlers
    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistSongsHandler = this.getPlaylistSongsHandler.bind(this);
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.exportPlaylistHandler = this.exportPlaylistHandler.bind(this);  // Bind handler untuk ekspor playlist
  }

  // Mendapatkan ID pengguna yang terautentikasi dari JWT
  _getAuthenticatedUserId(request) {
    const auth = request.auth && request.auth.credentials;
    if (!auth || !auth.id) {
      throw new ClientError('Missing authentication', 401);
    }
    return auth.id;
  }

  // Handler untuk ekspor playlist
  async exportPlaylistHandler(request, h) {
    const { playlistId } = request.params;  // Mengambil playlistId dari parameter
    const { targetEmail } = request.payload;  // Mengambil targetEmail dari body request

    // Cek apakah targetEmail disediakan
    if (!targetEmail) {
      throw new ClientError('targetEmail harus disediakan', 400);
    }

    // Ambil playlist dari database
    const playlist = await this._service.getPlaylistById(playlistId);

    if (!playlist) {
      throw new ClientError('Playlist tidak ditemukan', 404);
    }

    // Cek apakah pengguna yang mengirim permintaan adalah pemilik playlist
    if (playlist.owner !== request.auth.credentials.id) {
      throw new ClientError('Hanya pemilik playlist yang dapat mengekspor', 403);
    }

    // Kirim payload (playlistId dan targetEmail) ke RabbitMQProducer
    const payload = { playlistId, targetEmail };
    await RabbitMQProducer.send(payload);

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }

  // Handler lainnya tetap sama, tidak ada perubahan
  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const credentialId = this._getAuthenticatedUserId(request);

    const playlistId = await this._service.addPlaylist({ name, owner: credentialId });

    const response = h.response({ status: 'success', data: { playlistId } });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const credentialId = this._getAuthenticatedUserId(request);
    const playlists = await this._service.getPlaylistsByUser(credentialId);
    return { status: 'success', data: { playlists } };
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const credentialId = this._getAuthenticatedUserId(request);

    await this._songsService.getSongById(songId);
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.addSongToPlaylist(playlistId, songId, credentialId);

    const response = h.response({ status: 'success', message: 'Lagu berhasil ditambahkan ke playlist' });
    response.code(201);
    return response;
  }

  async getPlaylistSongsHandler(request) {
    const { id: playlistId } = request.params;
    const credentialId = this._getAuthenticatedUserId(request);

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this._service.getPlaylistWithSongs(playlistId);
    return { status: 'success', data: { playlist } };
  }

  async deletePlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const credentialId = this._getAuthenticatedUserId(request);

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.deleteSongFromPlaylist(playlistId, songId, credentialId);

    return { status: 'success', message: 'Lagu berhasil dihapus dari playlist' };
  }

  async deletePlaylistByIdHandler(request, h) {
    const { id: playlistId } = request.params;
    const credentialId = this._getAuthenticatedUserId(request);

    // only owner can delete playlist
    await this._service.verifyPlaylistOwner(playlistId, credentialId);
    await this._service.deletePlaylistById(playlistId);

    return { status: 'success', message: 'Playlist berhasil dihapus' };
  }
}

module.exports = PlaylistsHandler;

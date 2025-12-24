class ExportsHandler {
    constructor(service, validator, playlistsService) {
      this._service = service;
      this._validator = validator;
      this._playlistsService = playlistsService;
  
      this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
    }
  
    async postExportPlaylistHandler(request, h) {
      this._validator.validateExportPlaylistPayload(request.payload);
  
      const { playlistId } = request.params;
      const { targetEmail } = request.payload;
      const { id: userId } = request.auth.credentials;
  
      // Verifikasi bahwa user adalah pemilik playlist
      await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
  
      // Kirim message ke queue
      const message = {
        playlistId,
        targetEmail,
      };
  
      await this._service.sendMessage('export:playlists', JSON.stringify(message));
  
      return h.response({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
      }).code(201);
    }
  }
  
  module.exports = ExportsHandler;
class ExportsHandler {
    constructor(producerService, playlistsService, validator) {
      this._producerService = producerService;
      this._playlistsService = playlistsService;
      this._validator = validator;
  
      this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
    }
  
    async postExportPlaylistHandler(request, h) {
      this._validator.validateExportPlaylistPayload(request.payload);
      
      const { playlistId } = request.params;
      const { targetEmail } = request.payload;
      const { id: userId } = request.auth.credentials;
  
      // Verify user is owner of playlist
      await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
  
      // Send message to queue
      const message = JSON.stringify({
        playlistId,
        targetEmail,
      });
  
      await this._producerService.sendMessage('export:playlists', message);
  
      return h.response({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
      }).code(201);
    }
  }
  
  module.exports = ExportsHandler;
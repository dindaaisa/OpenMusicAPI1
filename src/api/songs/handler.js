class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const songId = await this._service.addSong(request.payload);

    return h.response({
      status: 'success',
      data: { songId },
    }).code(201);
  }

  async getSongsHandler(request) {
    const { title, performer } = request.query;

    const songs = await this._service.getSongs({ title, performer });

    return {
      status: 'success',
      data: { songs },
    };
  }

  async getSongByIdHandler(request) {
    const song = await this._service.getSongById(request.params.id);

    return {
      status: 'success',
      data: { song },
    };
  }

  async putSongByIdHandler(request) {
    this._validator.validateSongPayload(request.payload);
    await this._service.editSongById(request.params.id, request.payload);

    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(request) {
    await this._service.deleteSongById(request.params.id);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;

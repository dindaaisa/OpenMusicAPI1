const AlbumsService = require('./service');
const { NotFoundError, ClientError } = require('../../exceptions/ClientError');

const albumsService = new AlbumsService();

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  // Tambahkan Album
  async postAlbumHandler(request, h) {
    const { name, year } = request.payload;
    const albumId = await this._service.addAlbum({ name, year });

    return h.response({
      status: 'success',
      data: { albumId },
    }).code(201);
  }
}

// Perbaikan GET Detail Albums tanpa Cover URL
const getAlbumByIdHandler = async (request, h) => {
  try {
    const { id } = request.params;
    const album = await albumsService.getAlbumById(id);

    // Inisialisasi cover URL dengan null jika tidak tersedia
    album.coverUrl = album.coverUrl || null;

    return h.response({
      status: 'success',
      data: { album },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return h.response({
        status: 'fail',
        message: 'Album tidak ditemukan',
      }).code(404);
    }

    return h.response({
      status: 'error',
      message: 'Terjadi kesalahan pada server kami',
    }).code(500);
  }
};

// Validasi ukuran file untuk POST Tambahkan Sampul Album
const postCoverHandler = async (request, h) => {
  try {
    const { id } = request.params;
    const file = request.payload.cover;

    if (!file) {
      throw new ClientError('File tidak ditemukan dalam request');
    }

    if (file.hapi.headers['content-length'] > 512000) { // Validasi ukuran file
      return h.response({
        status: 'fail',
        message: 'Ukuran file terlalu besar',
      }).code(413);
    }

    const coverUrl = await albumsService.uploadCover(id, file);
    return h.response({
      status: 'success',
      data: { coverUrl },
    }).code(201);
  } catch (error) {
    return h.response({
      status: 'error',
      message: 'Terjadi kesalahan saat mengunggah sampul album',
    }).code(500);
  }
};

// Perbaikan POST Sampul Album dengan File Valid
const uploadValidCoverHandler = async (request, h) => {
  try {
    const { id } = request.params;
    const file = request.payload.cover;

    if (!file) {
      throw new ClientError('File tidak ditemukan dalam request');
    }

    const coverUrl = await albumsService.uploadCover(id, file);
    return h.response({
      status: 'success',
      data: { coverUrl },
    }).code(201);
  } catch (error) {
    return h.response({
      status: 'fail',
      message: error.message || 'Terjadi kesalahan saat mengunggah sampul album',
    }).code(400);
  }
};

// Pastikan Cover URL di GET sesuai dengan format
const getAlbumWithCoverHandler = async (request, h) => {
  try {
    const { id } = request.params;
    const album = await albumsService.getAlbumById(id);

    album.coverUrl = album.coverUrl || null; // Validasi

    return h.response({
      status: 'success',
      data: { album },
    }).code(200);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return h.response({
        status: 'fail',
        message: 'Album tidak ditemukan',
      }).code(404);
    }

    return h.response({
      status: 'error',
      message: 'Terjadi kesalahan pada server kami',
    }).code(500);
  }
};

module.exports = AlbumsHandler;

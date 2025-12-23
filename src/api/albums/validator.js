const ClientError = require('../../exceptions/ClientError');
const { albumPayloadSchema, exportPlaylistPayloadSchema } = require('../../validator/schema');

class AlbumsValidator {
  // Validasi payload untuk album
  validateAlbumPayload(payload) {
    const { error } = albumPayloadSchema.validate(payload, { convert: false });
    if (error) {
      throw new ClientError(error.message, 400);
    }
  }

  // Validasi payload untuk ekspor playlist (menambahkan validasi untuk targetEmail)
  validateExportPlaylistPayload(payload) {
    const { error } = exportPlaylistPayloadSchema.validate(payload, { convert: false });
    if (error) {
      throw new ClientError('Invalid email format', 400); // Menangani error jika email tidak valid
    }
  }
}

module.exports = AlbumsValidator;

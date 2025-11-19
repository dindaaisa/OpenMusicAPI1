const ClientError = require('../../exceptions/ClientError');
const { albumPayloadSchema } = require('../../validator/schema');

class AlbumsValidator {
  validateAlbumPayload(payload) {
    // Non-aktifkan conversion agar Joi tidak otomatis mengubah tipe
    const { error } = albumPayloadSchema.validate(payload, { convert: false });
    if (error) {
      throw new ClientError(error.message, 400);
    }
  }
}

module.exports = AlbumsValidator;
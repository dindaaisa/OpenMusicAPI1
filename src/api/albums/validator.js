const ClientError = require('../../exceptions/ClientError');
const { albumPayloadSchema } = require('../../validator/schema');

class AlbumsValidator {
  validateAlbumPayload(payload) {
    const { error } = albumPayloadSchema.validate(payload);
    if (error) {
      throw new ClientError(error.message, 400);
    }
  }
}

module.exports = AlbumsValidator;
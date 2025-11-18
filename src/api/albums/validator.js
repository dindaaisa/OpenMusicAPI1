// wrapper class that uses Joi schema
const { albumPayloadSchema } = require('../../validator/schemas');
const ClientError = require('../../exceptions/ClientError');

class AlbumsValidator {
  validateAlbumPayload(payload) {
    const { error } = albumPayloadSchema.validate(payload);
    if (error) {
      throw new ClientError(error.message, 400);
    }
  }
}

module.exports = AlbumsValidator;
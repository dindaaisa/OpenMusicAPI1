const ClientError = require('../../exceptions/ClientError');
const { songPayloadSchema } = require('../../validator/schema');

class SongsValidator {
  validateSongPayload(payload) {
    const { error } = songPayloadSchema.validate(payload, {
      abortEarly: true,
    });

    if (error) {
      throw new ClientError(error.message, 400);
    }
  }
}

module.exports = SongsValidator;

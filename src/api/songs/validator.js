const { songPayloadSchema } = require('../../validator/schema');
const ClientError = require('../../exceptions/ClientError');

class SongsValidator {
  validateSongPayload(payload) {
    // Non-aktifkan conversion agar Joi tidak otomatis mengubah tipe (mis. 123 -> "123")
    const { error } = songPayloadSchema.validate(payload, { convert: false });
    if (error) {
      throw new ClientError(error.message, 400);
    }
  }
}

module.exports = SongsValidator;
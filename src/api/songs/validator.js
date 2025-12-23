const { songPayloadSchema } = require('../../../../src/validator/schema');
const ClientError = require('../../../exceptions/ClientError');

class SongsValidator {
  validateSongPayload(payload) {
    const { error } = songPayloadSchema.validate(payload, { convert: false });
    if (error) {
      throw new ClientError(error.message, 400);
    }
  }
}

module.exports = SongsValidator;
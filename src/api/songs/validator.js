const Joi = require('joi');
const ClientError = require('../../exceptions/ClientError');
const { songPayloadSchema } = require('../../validator/schema.js');

class SongsValidator {
  validateSongPayload(payload) {
    const { error } = songPayloadSchema.validate(payload);
    if (error) {
      throw new ClientError(error.message, 400);
    }
  }
}

module.exports = SongsValidator;
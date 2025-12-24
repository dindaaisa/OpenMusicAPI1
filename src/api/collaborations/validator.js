const ClientError = require('../../exceptions/ClientError');
const Joi = require('joi');

const collaborationPayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});

class CollaborationsValidator {
  validateCollaborationPayload(payload) {
    const { error } = collaborationPayloadSchema.validate(payload);
    if (error) {
      throw new ClientError(error.message, 400);
    }
  }
}

module.exports = CollaborationsValidator;
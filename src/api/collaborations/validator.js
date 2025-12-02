const ClientError = require('../../exceptions/ClientError');
const Joi = require('joi');

const collaborationPayloadSchema = Joi.object({
  playlistId: Joi.string().required().messages({
    'any.required': 'Playlist id harus ada',
    'string.base': 'Playlist id harus berupa teks',
  }),
  userId: Joi.string().required().messages({
    'any.required': 'User id harus ada',
    'string.base': 'User id harus berupa teks',
  }),
});

class CollaborationsValidator {
  validateCollaborationPayload(payload) {
    const { error } = collaborationPayloadSchema.validate(payload, { convert: false });
    if (error) throw new ClientError(error.message, 400);
  }
}

module.exports = CollaborationsValidator;
const Joi = require('joi');
const ClientError = require('../../exceptions/ClientError');

const PostAuthenticationPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const PutAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const DeleteAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const AuthenticationsValidator = {
  validatePostAuthenticationPayload(payload) {
    const { error } = PostAuthenticationPayloadSchema.validate(payload);
    if (error) throw new ClientError(error.message, 400);
  },

  validatePutAuthenticationPayload(payload) {
    const { error } = PutAuthenticationPayloadSchema.validate(payload);
    if (error) throw new ClientError(error.message, 400);
  },

  validateDeleteAuthenticationPayload(payload) {
    const { error } = DeleteAuthenticationPayloadSchema.validate(payload);
    if (error) throw new ClientError(error.message, 400);
  },
};

module.exports = AuthenticationsValidator;

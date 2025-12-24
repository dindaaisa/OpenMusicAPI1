const ClientError = require('../../exceptions/ClientError');
const { 
  authenticationPayloadSchema, 
  refreshTokenPayloadSchema 
} = require('../../validator/schema');

class AuthenticationsValidator {
  validatePostAuthenticationPayload(payload) {
    const { error } = authenticationPayloadSchema.validate(payload);
    if (error) {
      throw new ClientError(error.message, 400);
    }
  }

  validatePutAuthenticationPayload(payload) {
    const { error } = refreshTokenPayloadSchema.validate(payload);
    if (error) {
      throw new ClientError(error.message, 400);
    }
  }

  validateDeleteAuthenticationPayload(payload) {
    const { error } = refreshTokenPayloadSchema.validate(payload);
    if (error) {
      throw new ClientError(error.message, 400);
    }
  }
}

module.exports = AuthenticationsValidator;
const ClientError = require('../../exceptions/ClientError');
const { authenticationPayloadSchema, refreshTokenPayloadSchema } = require('../../validator/schema');

class AuthenticationsValidator {
  validateAuthenticationPayload(payload) {
    const { error } = authenticationPayloadSchema.validate(payload, { convert: false });
    if (error) throw new ClientError(error.message, 400);
  }

  validateRefreshTokenPayload(payload) {
    const { error } = refreshTokenPayloadSchema.validate(payload, { convert: false });
    if (error) throw new ClientError(error.message, 400);
  }
}

module.exports = AuthenticationsValidator;
const ClientError = require('../../exceptions/ClientError');
const { userPayloadSchema } = require('../../validator/schema');

class UsersValidator {
  validateUserPayload(payload) {
    const { error } = userPayloadSchema.validate(payload, { convert: false });
    if (error) {
      throw new ClientError(error.message, 400);
    }
  }
}

module.exports = UsersValidator;
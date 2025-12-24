const ClientError = require('../../exceptions/ClientError');
const { exportPlaylistPayloadSchema } = require('../../validator/schema');

class ExportsValidator {
  validateExportPlaylistPayload(payload) {
    const { error } = exportPlaylistPayloadSchema.validate(payload);
    if (error) {
      throw new ClientError(error.message, 400);
    }
  }
}

module.exports = ExportsValidator;
const ClientError = require('../../exceptions/ClientError');
const { playlistPayloadSchema, playlistSongPayloadSchema } = require('../../validator/schema');

class PlaylistsValidator {
  validatePlaylistPayload(payload) {
    const { error } = playlistPayloadSchema.validate(payload, { convert: false });
    if (error) throw new ClientError(error.message, 400);
  }

  validatePlaylistSongPayload(payload) {
    const { error } = playlistSongPayloadSchema.validate(payload, { convert: false });
    if (error) throw new ClientError(error.message, 400);
  }
}

module.exports = PlaylistsValidator;
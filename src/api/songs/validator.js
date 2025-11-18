const Joi = require('joi');
const ClientError = require('../../exceptions/ClientError');

const songPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().min(1900).required(),
  performer: Joi.string().required(),
  genre: Joi.string().allow(null, ''),
  duration: Joi.number().integer().positive().allow(null),
  albumId: Joi.string().allow(null, ''),
});

const validateSongPayload = (payload) => {
  const validation = songPayloadSchema.validate(payload);
  if (validation.error) {
    // Gunakan ClientError agar flow error konsisten dengan handler/global error
    throw new ClientError(validation.error.message, 400);
  }
};

module.exports = {
  validateSongPayload,
  songPayloadSchema,
};
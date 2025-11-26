const Joi = require('joi');

const albumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().required(),
});

const songPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().required(),
  performer: Joi.string().required(),
  genre: Joi.string().required(),
  duration: Joi.number().integer().optional().allow(null),
  albumId: Joi.string().optional().allow(null),
});

// User & Auth schemas (V2)
const userPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  fullname: Joi.string().required(),
});

const authenticationPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const refreshTokenPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// Playlists
const playlistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const playlistSongPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = {
  albumPayloadSchema,
  songPayloadSchema,
  userPayloadSchema,
  authenticationPayloadSchema,
  refreshTokenPayloadSchema,
  playlistPayloadSchema,
  playlistSongPayloadSchema,
};
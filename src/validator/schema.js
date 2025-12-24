const Joi = require('joi');

/**
 * ALBUM
 */
const albumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().required(),
}).options({ allowUnknown: false });

/**
 * SONG
 */
const songPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().required(),
  performer: Joi.string().required(),
  genre: Joi.string().required(),
  duration: Joi.number().integer().optional().allow(null),
  albumId: Joi.string().optional().allow(null),
}).options({ allowUnknown: false });

/**
 * USER
 */
const userPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  fullname: Joi.string().required(),
}).options({ allowUnknown: false });

/**
 * AUTHENTICATION
 */
const authenticationPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
}).options({ allowUnknown: false });

const refreshTokenPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
}).options({ allowUnknown: false });

/**
 * PLAYLIST
 */
const playlistPayloadSchema = Joi.object({
  name: Joi.string().required(),
}).options({ allowUnknown: false });

const playlistSongPayloadSchema = Joi.object({
  songId: Joi.string().required(),
}).options({ allowUnknown: false });

/**
 * EXPORT PLAYLIST
 */
const exportPlaylistPayloadSchema = Joi.object({
  targetEmail: Joi.string().email().required(),
}).options({ allowUnknown: false });

module.exports = {
  albumPayloadSchema,
  songPayloadSchema,
  userPayloadSchema,
  authenticationPayloadSchema,
  refreshTokenPayloadSchema,
  playlistPayloadSchema,
  playlistSongPayloadSchema,
  exportPlaylistPayloadSchema,
};

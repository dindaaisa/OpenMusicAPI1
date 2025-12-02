const Joi = require('joi');

const albumPayloadSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Nama album harus ada',
    'string.base': 'Nama album harus berupa teks',
  }),
  year: Joi.number().integer().required().messages({
    'any.required': 'Tahun perilisan album harus ada',
    'number.base': 'Tahun perilisan harus berupa angka',
    'number.integer': 'Tahun perilisan harus berupa bilangan bulat',
  }),
});

const songPayloadSchema = Joi.object({
  title: Joi.string().required().messages({
    'any.required': 'Judul lagu harus ada',
    'string.base': 'Judul lagu harus berupa teks',
  }),
  year: Joi.number().integer().required().messages({
    'any.required': 'Tahun perilisan lagu harus ada',
    'number.base': 'Tahun perilisan harus berupa angka',
    'number.integer': 'Tahun perilisan harus berupa bilangan bulat',
  }),
  performer: Joi.string().required().messages({
    'any.required': 'Nama artis atau performer harus ada',
    'string.base': 'Nama performer harus berupa teks',
  }),
  genre: Joi.string().required().messages({
    'any.required': 'Genre lagu harus ada',
    'string.base': 'Genre harus berupa teks',
  }),
  duration: Joi.number().integer().optional().allow(null).messages({
    'number.base': 'Durasi lagu harus berupa angka',
    'number.integer': 'Durasi lagu harus berupa bilangan bulat',
  }),
  albumId: Joi.string().optional().allow(null).messages({
    'string.base': 'ID album harus berupa teks',
  }),
});

// User & Auth schemas (V2)
const userPayloadSchema = Joi.object({
  username: Joi.string().required().messages({
    'any.required': 'Username harus ada',
    'string.base': 'Username harus berupa teks',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password harus ada',
    'string.base': 'Password harus berupa teks',
  }),
  fullname: Joi.string().required().messages({
    'any.required': 'Nama lengkap harus ada',
    'string.base': 'Nama lengkap harus berupa teks',
  }),
});

const authenticationPayloadSchema = Joi.object({
  username: Joi.string().required().messages({
    'any.required': 'Username harus ada',
    'string.base': 'Username harus berupa teks',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password harus ada',
    'string.base': 'Password harus berupa teks',
  }),
});

const refreshTokenPayloadSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token harus ada',
    'string.base': 'Refresh token harus berupa teks',
  }),
});

// Playlists
const playlistPayloadSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Nama playlist harus ada',
    'string.base': 'Nama playlist harus berupa teks',
  }),
});

const playlistSongPayloadSchema = Joi.object({
  songId: Joi.string().required().messages({
    'any.required': 'ID lagu harus ada',
    'string.base': 'ID lagu harus berupa teks',
  }),
});

// Export the schemas
module.exports = {
  albumPayloadSchema,
  songPayloadSchema,
  userPayloadSchema,
  authenticationPayloadSchema,
  refreshTokenPayloadSchema,
  playlistPayloadSchema,
  playlistSongPayloadSchema,
};
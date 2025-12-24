const Jwt = require('jsonwebtoken');
const ClientError = require('../../exceptions/ClientError');

const TokenManager = {
  generateAccessToken(payload) {
    return Jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1h' });
  },

  generateRefreshToken(payload) {
    return Jwt.sign(payload, process.env.REFRESH_TOKEN_KEY, { expiresIn: '7d' });
  },

  verifyAccessToken(accessToken) {
    try {
      return Jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY);
    } catch (error) {
      throw new ClientError('Access token invalid', 400);
    }
  },

  verifyRefreshToken(refreshToken) {
    try {
      return Jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
    } catch (error) {
      throw new ClientError('Refresh token invalid', 400);
    }
  }
};

module.exports = TokenManager;

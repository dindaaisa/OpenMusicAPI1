const Jwt = require('jsonwebtoken');
const ClientError = require('../../exceptions/ClientError');

const TokenManager = {
  generateAccessToken(payload) {
    return Jwt.sign(payload, process.env.ACCESS_TOKEN_KEY);
  },

  generateRefreshToken(payload) {
    return Jwt.sign(payload, process.env.REFRESH_TOKEN_KEY);
  },

  verifyRefreshToken(refreshToken) {
    try {
      const decoded = Jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
      return decoded;
    } catch (error) {
      // Test biasanya minta 400 kalau refresh token invalid
      throw new ClientError('Refresh token tidak valid', 400);
    }
  },
};

module.exports = TokenManager;

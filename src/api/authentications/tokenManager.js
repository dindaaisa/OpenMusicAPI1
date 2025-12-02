const Jwt = require('jsonwebtoken');
const ClientError = require('../../exceptions/ClientError');

const ACCESS_TOKEN_KEY = process.env.ACCESS_TOKEN_KEY || 'access';
const REFRESH_TOKEN_KEY = process.env.REFRESH_TOKEN_KEY || 'refresh';
const ACCESS_TOKEN_AGE = process.env.ACCESS_TOKEN_AGE || '1800s'; // 30 minutes default

class TokenManager {
  generateAccessToken(payload) {
    return Jwt.sign(payload, ACCESS_TOKEN_KEY, { expiresIn: ACCESS_TOKEN_AGE });
  }

  generateRefreshToken(payload) {
    return Jwt.sign(payload, REFRESH_TOKEN_KEY);
  }

  verifyRefreshToken(token) {
    try {
      const decoded = Jwt.verify(token, REFRESH_TOKEN_KEY);
      return decoded;
    } catch (err) {
      // lempar ClientError agar handler mengembalikan 400 (Bad Request) sesuai test spec
      throw new ClientError('Refresh token tidak valid', 400);
    }
  }
}

module.exports = new TokenManager();
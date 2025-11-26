const ClientError = require('../../exceptions/ClientError');

class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    this._validator.validateAuthenticationPayload(request.payload);

    const { username, password } = request.payload;
    const userId = await this._usersService.verifyUserCredential(username, password);

    const accessToken = this._tokenManager.generateAccessToken({ userId });
    const refreshToken = this._tokenManager.generateRefreshToken({ userId });

    await this._authenticationsService.addToken(refreshToken);

    const response = h.response({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }

  async putAuthenticationHandler(request, h) {
    this._validator.validateRefreshTokenPayload(request.payload);
    const { refreshToken } = request.payload;

    await this._authenticationsService.verifyToken(refreshToken);

    const { userId } = this._tokenManager.verifyRefreshToken(refreshToken);
    const accessToken = this._tokenManager.generateAccessToken({ userId });

    return {
      status: 'success',
      data: { accessToken },
    };
  }

  async deleteAuthenticationHandler(request, h) {
    this._validator.validateRefreshTokenPayload(request.payload);
    const { refreshToken } = request.payload;

    await this._authenticationsService.verifyToken(refreshToken);
    await this._authenticationsService.deleteToken(refreshToken);

    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}

module.exports = AuthenticationsHandler;
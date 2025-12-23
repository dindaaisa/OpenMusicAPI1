const redis = require('redis');
const config = require('../../utils/config');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: config.redis.host, // WAJIB pakai socket (sesuai materi Dicoding)
      },
    });

    this._client.on('error', (err) => {
      console.error('Redis Error:', err);
    });

    // pastikan hanya connect sekali
    this._connecting = this._client.connect();
  }

  async get(key) {
    await this._connecting;
    return this._client.get(key);
  }

  async set(key, value, ttl = 1800) {
    await this._connecting;
    await this._client.set(key, value, { EX: ttl }); // TTL 30 menit
  }

  async del(key) {
    await this._connecting;
    await this._client.del(key);
  }
}

module.exports = CacheService;

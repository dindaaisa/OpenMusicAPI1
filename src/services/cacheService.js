const redis = require('redis');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: process.env.REDIS_SERVER,
        port: process.env.REDIS_PORT || 6379,
      },
    });

    this._client.on('error', (error) => {
      console.error('Redis Client Error:', error);
    });

    this._client.connect().catch(console.error);
  }

  async set(key, value, expirationInSecond = 1800) {
    await this._client.set(key, value, {
      EX: expirationInSecond,
    });
  }

  async get(key) {
    const result = await this._client.get(key);
    return result;
  }

  async del(key) {
    await this._client.del(key);
  }

  async close() {
    await this._client.quit();
  }
}

module.exports = CacheService;
const redis = require('redis');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: process.env.REDIS_SERVER || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    });

    this._client.on('error', (error) => {
      console.error('❌ Redis Client Error:', error);
    });

    // Connect to Redis
    this._client.connect()
      .then(() => console.log('✅ Redis connected'))
      .catch((err) => console.error('❌ Redis connection failed:', err));
  }

  async set(key, value, expirationInSecond = 1800) {
    try {
      await this._client.set(key, value, {
        EX: expirationInSecond,
      });
    } catch (error) {
      console.error('Redis SET error:', error);
    }
  }

  async get(key) {
    try {
      const result = await this._client.get(key);
      return result;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async del(key) {
    try {
      await this._client.del(key);
    } catch (error) {
      console.error('Redis DEL error:', error);
    }
  }

  async close() {
    await this._client.quit();
  }
}

module.exports = CacheService;
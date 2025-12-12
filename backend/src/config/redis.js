const redis = require('redis');

let redisClient = null;

const connectRedis = async () => {
  // Skip Redis if explicitly disabled
  if (process.env.DISABLE_REDIS === 'true') {
    console.log('📝 Redis disabled by environment variable - running without cache');
    return;
  }

  try {
    // Create Redis client
    redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retry_strategy: (options) => {
        // Limit retry attempts for development
        if (options.attempt > 3) {
          console.log('⚠️  Redis unavailable - continuing without cache');
          return undefined;
        }
        return Math.min(options.attempt * 1000, 3000);
      }
    });

    // Handle Redis events
    redisClient.on('connect', () => {
      console.log('🔴 Redis connecting...');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis connected and ready');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
    });

    redisClient.on('end', () => {
      console.log('🔌 Redis connection closed');
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });

    // Connect to Redis
    await redisClient.connect();

  } catch (error) {
    console.log('⚠️  Redis unavailable - application will work without caching');
    redisClient = null;
  }
};

// Cache utility functions
const cacheUtils = {
  // Set cache with expiration (default 1 hour)
  async set(key, value, expireInSeconds = 3600) {
    if (!redisClient) return false;
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await redisClient.setEx(key, expireInSeconds, stringValue);
      return true;
    } catch (error) {
      console.error('❌ Redis SET error:', error.message);
      return false;
    }
  },

  // Get cache
  async get(key) {
    if (!redisClient) return null;
    try {
      const value = await redisClient.get(key);
      if (!value) return null;
      
      // Try to parse as JSON, if it fails return as string
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('❌ Redis GET error:', error.message);
      return null;
    }
  },

  // Delete cache
  async del(key) {
    if (!redisClient) return false;
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('❌ Redis DEL error:', error.message);
      return false;
    }
  },

  // Check if cache exists
  async exists(key) {
    if (!redisClient) return false;
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('❌ Redis EXISTS error:', error.message);
      return false;
    }
  },

  // Clear all cache (use with caution)
  async flush() {
    if (!redisClient) return false;
    try {
      await redisClient.flushAll();
      return true;
    } catch (error) {
      console.error('❌ Redis FLUSH error:', error.message);
      return false;
    }
  },

  // Get cache status
  getStatus() {
    return {
      connected: redisClient ? redisClient.isReady : false,
      client: redisClient ? 'available' : 'unavailable'
    };
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('🛑 Redis connection closed through app termination');
    } catch (err) {
      console.error('❌ Error closing Redis connection:', err);
    }
  }
});

module.exports = { connectRedis, cacheUtils, redisClient };
const Redis = (process.env.NODE_ENV === 'test' || process.env.USE_REDIS_MOCK === 'true')
    ? require('ioredis-mock')
    : require('ioredis');

require('dotenv').config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redis;
try {
    redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
            return Math.min(times * 50, 2000);
        },
        // ioredis-mock doesn't need these but real one does
        reconnectOnError: (err) => {
            const targetError = 'READONLY';
            if (err.message.includes(targetError)) {
                return true;
            }
        }
    });
} catch (e) {
    console.warn('Failed to initialize Redis, falling back to mock');
    const MockRedis = require('ioredis-mock');
    redis = new MockRedis();
}


redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

redis.on('connect', () => {
    console.log('Connected to Redis');
});

module.exports = redis;

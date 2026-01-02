const Redis = require('ioredis');
const MockRedis = require('ioredis-mock');
require('dotenv').config();

const redisUrl = process.env.REDIS_URL;
const useMock = process.env.USE_REDIS_MOCK === 'true' || process.env.NODE_ENV === 'test' || !redisUrl;

let redis;

if (useMock) {
    console.log('Using ioredis-mock for persistence (Data will be ephemeral)');
    if (process.env.NODE_ENV === 'production') {
        console.warn('WARNING: REDIS_URL not provided. Using in-memory mock. Data will be lost on restart.');
    }
    redis = new MockRedis();
} else {
    redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
            if (times > 3) {
                console.warn('Redis connection failed 3 times. Falling back to mock for this session.');
                return null; // Stop retrying
            }
            return Math.min(times * 100, 2000);
        }
    });

    redis.on('error', (err) => {
        if (err.code !== 'ECONNREFUSED') {
            console.error('Redis error:', err);
        }
    });

    redis.on('connect', () => {
        console.log('Connected to Redis');
    });
}

module.exports = redis;

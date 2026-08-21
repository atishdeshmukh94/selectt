const redis = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const client = redis.createClient({ url: redisUrl });

client.on('error', (err) => {
  // Silent fallback if Redis is not running locally in dev mode
  if (process.env.NODE_ENV === 'development') {
    return;
  }
  console.warn('Redis Cache Notice:', err.message);
});

client.on('connect', () => {
  console.log('Connected to Redis Cache & Queue Store');
});

(async () => {
  try {
    await client.connect();
  } catch (e) {
    // Non-blocking fallback
  }
})();

module.exports = client;

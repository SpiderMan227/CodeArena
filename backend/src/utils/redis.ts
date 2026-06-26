import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on('error', (err) => {
  console.error('[Redis Client Error]:', err);
});

// Auto-connect to Redis
redisClient.connect().then(() => {
  console.log('[Redis]: Connected successfully to Redis.');
}).catch((err) => {
  console.error('[Redis]: Failed to connect to Redis:', err);
});

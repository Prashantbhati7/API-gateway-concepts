import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const rateLimiter = (limit, window,message) => {
  return async (req, res, next) => {
    const ip = req.ip;
    const key = `rate_limit:${ip}`;

    try {
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, window);
      }

      if (current > limit) {
        return res.status(429).json({ message: message || 'Too many requests, please try again later.' });
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

export default rateLimiter;
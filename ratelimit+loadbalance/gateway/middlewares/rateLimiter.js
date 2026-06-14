import redis from '../lib/RedisClient.js';

// const rateLimiter = (limit, window,message) => {
//   return async (req, res, next) => {
//     const key = `rate_limit:${req.ip}:${req.originalUrl}`;

//     try {     
//       const currentTime = Date.now();
//       const windowStart = currentTime - window * 1000;

//       await redis.zremrangebyscore(key, 0, windowStart);


//       const count = await redis.zcard(key);

//       if (count >= limit) {
//         return res.status(429).json({ message: message || 'Too many requests, please try again later.' });
//       }


//       await redis.zadd(key,currentTime, currentTime - Math.floor(Math.random() * 1000));
//       await redis.expire(key, window);
//       next();
//     } catch (error) {
//       console.error('Rate limiter error:', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   };
// };

const rateLimiter = (req,res,next)=>{
    const routeConfig = req.routeConfig;
    if(routeConfig && routeConfig.ratelimit){
        const { max, windowMs, message } = routeConfig.ratelimit;
        const key = `rate_limit:${req.ip}:${req.originalUrl}`;

        redis.zremrangebyscore(key, 0, Date.now() - windowMs);
        redis.zcard(key).then(count => {
            if (count >= max) {
                return res.status(429).json({ message: message || 'Too many requests, please try again later.' });
            }
            redis.zadd(key, Date.now(), Date.now() - Math.floor(Math.random() * 1000));
            redis.expire(key, Math.ceil(windowMs / 1000));
            next();
        }).catch(error => {
            console.error('Rate limiter error:', error);
            res.status(500).json({ message: 'Internal server error' });
        });
    } else {
        next();
    } 
}


export default rateLimiter;
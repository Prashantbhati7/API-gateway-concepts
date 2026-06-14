import express from 'express';

const app = express();
app.use(express.json());

const PORT = 3000;



import loggerMiddleware from './middlewares/logger.js';
import authMiddleware from './middlewares/auth.js';
import ApiError from './utils/apiError.js';
import asyncHandler from './utils/asyncHandler.js';
import configurations from './config.js';
import rateLimiter from './middlewares/rateLimiter.js';
import LoadBalancer from './utils/LoadBalaner.js';
import { healthController } from './routes/health.js';

app.use(loggerMiddleware);

app.use(asyncHandler( async (req,res,next)=>{
    const config = configurations.find(c=> req.path.startsWith(c.prefix));
    if(!config){
        throw new ApiError(404,"Route not found");
    }

    req.routeConfig = config;
   next();
}));


app.use(rateLimiter);


app.use(authMiddleware);


app.use(asyncHandler( async(req,res,next)=>{
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
        abortController.abort();
    }, 5000);
    const route = req.routeConfig;
    const targetIndex = LoadBalancer(route);
    const targetUrl = route.target[targetIndex] + req.originalUrl;

    try{
        const forwardedHeaders  = {...req.headers};
        const hasRequestBody = !['GET', 'HEAD'].includes(req.method);
        const requestBody = hasRequestBody ? JSON.stringify(req.body ?? {}) : undefined;

        // Remove hop-by-hop and stale transport headers before re-sending.
        delete forwardedHeaders['host'];
        delete forwardedHeaders['connection'];
        delete forwardedHeaders['content-length'];
        delete forwardedHeaders['transfer-encoding'];
        delete forwardedHeaders['x-user']; // Remove x-user header if exists 

        forwardedHeaders['x-user'] = req.user ? JSON.stringify(req.user) : '';
        if (hasRequestBody) {
            forwardedHeaders['content-type'] = forwardedHeaders['content-type'] || 'application/json';
        }
        
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: forwardedHeaders,
            signal: abortController.signal,
            body: requestBody,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new ApiError(response.status, errorData.error || 'Error from target service');
        }

        const data = await response.json();
        return res.status(response.status).json(data);
    }

    catch(error){
        if (error.name === 'AbortError') {
            return next(new ApiError(504, 'Gateway Timeout: Target service did not respond in time'));
        }
        if(error.cause?.code === 'ECONNREFUSED'){
            return next(new ApiError(502, 'Bad Gateway: Unable to reach target service'));
        }
        return next(new ApiError(500, error.message || 'Error forwarding request to target service'));
    }

    finally{
        clearTimeout(timeoutId); 
    }
    
}));


app.use((err,req,res,next)=>{
   if(res.headersSent){
      return next(err);
   }
   return res.status(err.statusCode || 500).json({
      success:false,
      error: err.message || "Internal Server Error"
   });
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

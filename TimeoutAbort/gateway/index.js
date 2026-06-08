import express from 'express';

const app = express();
app.use(express.json());

const PORT = 3000;

const routes = [
    {
        prefix:'/orders',
        auth:true,
        target:'http://localhost:3001'
    },
    {
        prefix:'/auth',
        auth:false,
        target:'http://localhost:3002'
    }
]

import loggerMiddleware from './middlewares/logger.js';
import authMiddleware from './middlewares/auth.js';
import ApiError from './utils/apiError.js';
import asyncHandler from './utils/asyncHandler.js';

app.use(loggerMiddleware);

app.use(asyncHandler( async (req,res,next)=>{
    const route = routes.find(r=> req.path.startsWith(r.prefix));
    if(!route){
        throw new ApiError(404,"Route not found");
    }
    req.routeConfig = route;
    if (route.auth){
        return authMiddleware(req,res,next);
    }
    next();
}));

app.use(asyncHandler( async(req,res,next)=>{
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
        abortController.abort();
    }, 5000);
    const route = req.routeConfig;
    const targetUrl = route.target + req.originalUrl;
    try{
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers['authorization'] || '',
                'x-user': req.user ? JSON.stringify(req.user) : ''
            },
            signal: abortController.signal,
            body: (req.method !== 'GET') ? JSON.stringify(req.body) : null,
        });
         if (!response.ok) {
            const errorData = await response.json();
            throw new ApiError(response.status, errorData.error || 'Error from target service');
        }

        const data = await response.json();
        return res.status(response.status).json(data);
    }
    finally{
        clearTimeout(timeoutId);
        
    }
    
}));


app.use((err,req,res,next)=>{
   if (err.name === 'AbortError') {
      return res.status(504).json({ success: false, error: 'Request timed out' });
   }
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
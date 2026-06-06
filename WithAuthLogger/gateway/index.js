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

app.use(loggerMiddleware);

app.use(async (req,res,next)=>{
    const route = routes.find(r=> req.path.startsWith(r.prefix));
    if(!route){
        return res.status(404).json({error:'Route not found'});
    }
    if (route.auth){
        return authMiddleware(req,res,next);
    }
    next();
});


app.use(async(req,res,next)=>{
    try{
        const route = routes.find(r=> req.path.startsWith(r.prefix));
        const targetUrl = route.target + req.originalUrl;
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers['authorization'] || '',
                'x-user': req.user ? JSON.stringify(req.user) : ''
            },
            body: (req.method !== 'GET') ? JSON.stringify(req.body) : null,
        });
        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json(errorData);
        }
        const data = await response.json();
        return res.status(response.status).json(data);
    }catch(error){
        return res.status(503).json({"message":"service unavailable"});
    }
})




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
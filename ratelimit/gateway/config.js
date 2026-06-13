const configurations = [
    {
        prefix:'/orders',
        auth:true,
        target:'http://localhost:3001',
        ratelimit:{
            windowMs: 60 * 1000, // 1 minute
            max: 2, // limit each IP to 20 requests per windowMs
            message: 'Too many requests, please try again later.'
        }
    },
    {
        prefix:'/auth',
        auth:false,
        target:'http://localhost:3002',
        ratelimit:{
            windowMs: 60 * 1000, // 1 minute
            max: 5, // limit each IP to 5 requests per windowMs
            message: 'Too many requests, please try again later.'
        }
    },
    {
        prefix:'/products',
        auth:false,
        target:'http://localhost:3003',
        ratelimit:{
            windowMs: 60 * 1000, // 1 minute
            max: 10, // limit each IP to 50 requests per windowMs
            message: 'Too many requests, please try again later.'
        }
    }
]

export default configurations;
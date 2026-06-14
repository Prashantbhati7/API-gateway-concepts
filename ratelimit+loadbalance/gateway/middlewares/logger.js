const LoggerMiddleware = (req,res,next)=>{
    const start = new Date().getTime();
    req.startTime = start;
    console.log("TimeStamp:", req.startTime);
    console.log("Method:", req.method);
    console.log("URL:", req.originalUrl);
    res.on('finish', () => {
        console.log("Latency:", new Date().getTime() - req.startTime, "ms");
        console.log("Response Status:", res.statusCode);
    })
    next();
}

export default LoggerMiddleware;
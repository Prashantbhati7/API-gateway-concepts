import express from 'express';

const app = express();
app.use(express.json());

const PORT = 3000;

const routes  = {
    '/users': 'http://localhost:3002',
    '/orders': 'http://localhost:3001'
}


const loggerMiddleware = (req, res, next) => {
    console.log("TimeStamp:", new Date().toLocaleString());
    console.log("Method:", req.method);
    console.log("URL:", req.originalUrl);
    console.log("statuscode:", res.statusCode);
    next();
}


app.use(loggerMiddleware,async (req, res) => {
    try{
      const service = req.path.split('/')[1];
      let targetUrl = routes['/'+service];
      if (!targetUrl) {
        return res.status(404).json({ error: 'Service Not Found' });
      }
      targetUrl += req.originalUrl;
      const response = await fetch(targetUrl, {
          method: req.method,
          headers: req.headers,
          body: req.method === 'GET' ? null : JSON.stringify(req.body)
      });
      //console.log("response from service", response);
      if(!response.ok){
        return res.status(response.status).json({ error: 'Service Unavailable' });
      }
      
      const data = await response.json();
      
      return res.status(response.status).json(data);  
    }catch(error){
      return res.status(503).json({ error: 'Service Unavailable' });
    }
})

app.listen(PORT, () => {
  console.log(`gateway is running on port ${PORT}`);
});
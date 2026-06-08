import express from 'express';

const app = express();
app.use(express.json());

const PORT = 3001;

const orders = {
    'Unknown': [
        { item: 'Sample Item', quantity: 1 }
    ]
}

app.use((req,res,next)=>{
    const userHeader = req.headers['x-user'];
    if (userHeader) {
        req.user = JSON.parse(userHeader);
    }
    next();
})


app.get('/orders', (req, res) => {
    const user = req.user || { username: 'Unknown' }; // Fallback for testing without auth
    const userOrders = orders[user.username] || [];
    while(true){} // Simulate a long-running request to trigger timeout
    
    //res.status(200).json({ orders: userOrders });
});




app.post('/orders', (req, res) => {
    const { item, quantity } = req.body;
    const user = req.user ;
    if (!item || !quantity) {
        return res.status(400).json({ error: 'Item and quantity are required' });
    }
    orders[user.username] = [...(orders[user.username] || []), { item, quantity }];
    res.status(201).json({ message: 'Order created successfully', order: {item, quantity } });
});

app.listen(PORT, () => {
    console.log(`Order service is running on port ${PORT}`);
});
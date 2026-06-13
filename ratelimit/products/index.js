import express from 'express';
import products from './data.js';

const app = express();
app.use(express.json());

const PORT = 3003;


app.get('/products',(req,res)=>{
    res.json({
        success:true,
        data:products
    })
})

app.post('/products',(req,res)=>{
    const {name,price} = req.body;
    if(!name || !price){
        return res.status(400).json({
            success:false,
            error:"Name and price are required"
        })
    }
    const newProduct = {
        id: products.length + 1,
        name,
        price
    }
    products.push(newProduct);
    res.status(201).json({
        success:true,
        data:newProduct
    })
})

app.get('/products/:id',(req,res)=>{
    const product = products.find(p=> p.id === parseInt(req.params.id));
    if(!product){
        return res.status(404).json({
            success:false,
            error:"Product not found"
        })
    }
    res.json({
        success:true,
        data:product
    })
})


app.listen(PORT, () => {
    console.log("Product service is running on port " + PORT);
});
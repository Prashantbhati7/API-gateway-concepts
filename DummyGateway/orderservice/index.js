import express from 'express';

const app = express();
app.use(express.json());

const PORT = 3001;

app.get('/orders',(req, res) => {
  return res.status(200).json({ orders: [
    { id: 1, item: 'Laptop', quantity: 1 },
    { id: 2, item: 'Phone', quantity: 2 },
  ]});
});

app.listen(PORT, () => {
  console.log(`order Service is running on port ${PORT}`);
});
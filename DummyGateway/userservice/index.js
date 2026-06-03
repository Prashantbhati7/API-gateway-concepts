import express from 'express';

const app = express();
app.use(express.json());

const PORT = 3002;

app.get('/users',(req, res) => {
  return res.status(200).json({ users: [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  ]});
});

app.listen(PORT, () => {
  console.log(`User Service is running on port ${PORT}`);
});
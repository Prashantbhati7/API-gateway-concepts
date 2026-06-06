import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3002;

const registeredUseres = {
    'user1@gmail.com':'password1'
}

app.use((req,res,next)=>{
    console.log("req at user service");
    next();
})

app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (registeredUseres[username] && registeredUseres[username] === password) {
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({message:"Login successful", token });
    }
    return res.status(401).json({ error: 'Invalid credentials' });
});

app.post('/auth/register',(req,res)=>{
    console.log("Registering user");
    const { username, password } = req.body;
    if(registeredUseres[username]){
        return res.status(400).json({ error: 'User already exists' });
    }
    console.log("Registering user: ", username);
    registeredUseres[username] = password;
    console.log("Registered users = ", registeredUseres);
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log("token = ", token);
    return res.status(201).json({ message: 'User registered successfully', token });
});

app.listen(PORT, () => {
    console.log(`User service is running on port ${PORT}`);
});
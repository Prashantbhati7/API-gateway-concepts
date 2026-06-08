
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

const authMiddleware = (req, res, next) => {
    try{
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    req.user = decoded;
    next();
    }
    catch(error){
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

export default authMiddleware;
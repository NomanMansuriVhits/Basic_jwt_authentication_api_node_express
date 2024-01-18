import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectMongoDb from './src/configs/connectDb.js';
import userRouter from './src/routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

// Database Called
connectMongoDb(DATABASE_URL);

// Cors Policy
app.use(cors());
// Json
app.use(express.json());

// Load Routes
app.use("/api/user", userRouter);

app.listen(PORT,(()=>{
   console.log(`Server listing at http://localhost:${PORT}`);    
}));
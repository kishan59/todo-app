import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';

dotenv.config();
const port = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cookieParser()); 

app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => res.send('Server is ready'));

app.use(notFound);
app.use(errorHandler);


app.listen(port, () => console.log(`Server started on port ${port}`));
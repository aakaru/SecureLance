import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import gigRoutes from './routes/gigRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import path from 'path';
dotenv.config();
connectDB();
const app = express();
const corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:8081'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'backend', 'uploads')));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/gigs', gigRoutes);
app.use('/api/v1/submissions', submissionRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.get('/', (req, res) => {
  res.send('SecureLance API Running');
});
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import problemRoutes from './routes/problem.routes';
import aiRoutes from './routes/ai.routes';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

// Base API Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CodeArena API Server is running' });
});

// Global Error Handler
app.use(errorHandler);

export default app;

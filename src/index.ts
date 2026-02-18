import express from 'express';
import { config } from './config/env';
import authRoutes from './routes/authRoutes';
import { errorHandler } from './middlewares/errorHandler';
import userRoutes from './routes/userRoutes';
import coupleRoutes from './routes/coupleRoutes';
import challengeRoutes from './routes/challengeRoutes';
import taskRoutes from './routes/taskRoutes';
import taskCompletionRoutes from './routes/taskCompletionRoutes';
import cors from 'cors';


const app = express();

// Middlewares globais
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}));
app.use(express.json());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/couples', coupleRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/task-completions', taskCompletionRoutes);  // ← Adiciona (depois de taskRoutes)


app.use(errorHandler);

// Iniciar servidor
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
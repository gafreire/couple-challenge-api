import express from 'express';
import { config } from './config/env';
import authRoutes from './routes/authRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Middlewares globais
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);

app.use(errorHandler);

// Iniciar servidor
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
import express from 'express';
import { config } from './config/env';

const app = express();

// Middlewares básicos
app.use(express.json());

// Rota de teste
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Iniciar servidor
app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
});
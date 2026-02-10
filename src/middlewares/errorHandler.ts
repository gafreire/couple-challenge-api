import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Se for um AppError (nossos erros customizados)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  // Se for um erro desconhecido (não tratado)
  console.error('Unexpected error:', err);
  
  return res.status(500).json({
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Internal server error'
  });
};
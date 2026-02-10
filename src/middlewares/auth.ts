import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { UnauthorizedError } from '../errors/AppError';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Pegar o header Authorization
    const authHeader = req.headers.authorization;

    // 2. Validar se existe
    if (!authHeader) {
      throw new UnauthorizedError('Token not provided');
    }

    // 3. Extrair o token (split do Bearer)
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Token format is invalid');
    }

    // 4. Validar se token existe após o split
    const token = parts[1];
    if (!token) {
      throw new UnauthorizedError('Token is empty');
    }
    
    // 5. Validar o token usando authService.validateToken()
    const decoded = await authService.validateToken(token);
    

    // 6. Adicionar dados do usuário no req (pra usar no controller)
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      coupleId: decoded.coupleId,
    };
    

    // 7. Chamar next() pra continuar
    next()

  } catch (error) {
    next(error);
  }
};
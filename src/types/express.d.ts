import { JwtPayload } from '../services/authService';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        name: string;
        coupleId: string | null;
      };
    }
  }
}
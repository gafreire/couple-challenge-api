import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.use(authMiddleware); // ← Aplica em todas abaixo

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

export default router;
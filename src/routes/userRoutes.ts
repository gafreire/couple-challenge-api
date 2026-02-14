import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.use(authMiddleware); // ← Aplica em todas abaixo

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/all', userController.getAllUsers);
router.get('/:userId/auth-providers', userController.getUserAuthProviders);



export default router;
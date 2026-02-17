import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { challengeController } from '../controllers/challenge.controller';

const router = Router();

// Protege todas as rotas
router.use(authMiddleware);

router.post('/', challengeController.createChallenge);

export default router;
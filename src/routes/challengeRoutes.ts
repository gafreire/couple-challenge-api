import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { challengeController } from '../controllers/challenge.controller';

const router = Router();

// Protege todas as rotas
router.use(authMiddleware);

router.post('/', challengeController.createChallenge);
router.get('/active', challengeController.getActiveChallenge);
router.get('/', challengeController.listChallenges);
router.get('/:challengeId/tasks', challengeController.listTasks);
router.get('/:challengeId/score', challengeController.getChallengeScore);
router.put('/:challengeId/finish', challengeController.finishChallenge);

export default router;
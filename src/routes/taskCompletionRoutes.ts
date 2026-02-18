import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { taskCompletionController } from '../controllers/taskCompletion.controller';

const router = Router();

router.use(authMiddleware);

router.post('/', taskCompletionController.completeTask);

export default router;
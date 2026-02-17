import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { taskController } from '../controllers/task.controller';

const router = Router();

router.use(authMiddleware);

router.post('/', taskController.createTask);

export default router;


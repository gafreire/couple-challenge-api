import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { coupleController } from '../controllers/couple.controller';

const router = Router();

// Protege todas as rotas
router.use(authMiddleware);

router.post('/', coupleController.createCouple);           // POST /api/couples
router.delete('/:coupleId', coupleController.cancelInvite); // DELETE /api/couples/:coupleId

export default router;
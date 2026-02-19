import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { coupleController } from '../controllers/couple.controller';

const router = Router();

// Protege todas as rotas
router.use(authMiddleware);

router.post('/', coupleController.createCouple);
router.get('/invites', coupleController.listPendingInvites);
router.get('/all', coupleController.listAllCouples);
router.get('/me', coupleController.getMyCouple);
router.delete('/me', coupleController.leaveCouple); 
router.get('/me/pending', coupleController.getMyPendingCouple);
router.put('/:coupleId/accept', coupleController.acceptInvite);
router.put('/:coupleId/decline', coupleController.declineInvite);
router.delete('/:coupleId', coupleController.cancelInvite); 

export default router;
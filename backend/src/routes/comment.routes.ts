import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.patch('/:id', CommentController.update);
router.delete('/:id', CommentController.delete);

export default router;

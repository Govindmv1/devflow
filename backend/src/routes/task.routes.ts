import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { CommentController } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Dashboard stats
router.get('/dashboard/stats', TaskController.getDashboardStats);

// My tasks
router.get('/my', TaskController.getMyTasks);

// Task CRUD
router.get('/:id', TaskController.getById);
router.patch('/:id', TaskController.update);
router.delete('/:id', TaskController.delete);

// Task comments
router.get('/:taskId/comments', CommentController.getByTask);
router.post('/:taskId/comments', CommentController.create);

export default router;

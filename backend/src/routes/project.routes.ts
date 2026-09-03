import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { TaskController } from '../controllers/task.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// All project routes require authentication
router.use(authenticate);

router.get('/', ProjectController.getAll);
router.get('/:id', ProjectController.getById);
router.post('/', authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER), ProjectController.create);
router.patch('/:id', authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER), ProjectController.update);
router.delete('/:id', authorize(UserRole.ADMIN), ProjectController.delete);

// Project members
router.get('/:id/members', ProjectController.getMembers);
router.post('/:id/members', authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER), ProjectController.addMember);
router.delete('/:id/members/:userId', authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER), ProjectController.removeMember);

// Project tasks
router.get('/:projectId/tasks', TaskController.getByProject);
router.post('/:projectId/tasks', authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER), TaskController.create);

// Project activity
router.get('/:id/activity', ProjectController.getActivity);

export default router;

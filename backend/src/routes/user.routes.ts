import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// Get current user profile
router.get('/me', authenticate, AuthController.me);

// Get all users (available to all logged-in members to assign tasks/members)
router.get('/', authenticate, AuthController.getAllUsers);

export default router;

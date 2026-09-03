import { Router, Request, Response, NextFunction } from 'express';
import { AIService } from '../integrations/ai.service';
import { TaskRepository } from '../repositories/task.repository';
import { authenticate } from '../middleware/auth';
import { ApiResponseHelper } from '../utils/response';

const router = Router();
router.use(authenticate);

// AI status check
router.get('/status', (_req: Request, res: Response) => {
  ApiResponseHelper.success(res, AIService.getStatus());
});

// Generate task description
router.post('/task-description', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, context } = req.body;
    const description = await AIService.generateTaskDescription(title, context);
    ApiResponseHelper.success(res, { description });
  } catch (error) { next(error); }
});

// Generate subtasks
router.post('/subtasks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description } = req.body;
    const subtasks = await AIService.generateSubtasks(title, description);
    ApiResponseHelper.success(res, { subtasks });
  } catch (error) { next(error); }
});

// Generate project summary
router.post('/project-summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, projectName } = req.body;
    const tasks = projectId ? await TaskRepository.findByProject(projectId) : [];
    const summary = await AIService.generateProjectSummary(projectName || 'Unnamed Project', tasks);
    ApiResponseHelper.success(res, { summary });
  } catch (error) { next(error); }
});

export default router;

import { Request, Response, NextFunction } from 'express';
import { TaskRepository } from '../repositories/task.repository';
import { ActivityRepository } from '../repositories/activity.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { ApiResponseHelper } from '../utils/response';
import { NotFoundError } from '../utils/errors';
import { AuthRequest } from '../types';

export class TaskController {
  static async getByProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = req.params.projectId as string;
      const { status, priority, assignee, search } = req.query;
      const tasks = await TaskRepository.findByProject(projectId, {
        status: status as string | undefined, priority: priority as string | undefined,
        assignee: assignee as string | undefined, search: search as string | undefined,
      });
      ApiResponseHelper.success(res, tasks);
    } catch (error) { next(error); }
  }

  static async getMyTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & AuthRequest).user!;
      const { status, priority, search } = req.query;
      const tasks = await TaskRepository.findAllForUser(user.userId, {
        status: status as string | undefined, priority: priority as string | undefined, search: search as string | undefined,
      });
      ApiResponseHelper.success(res, tasks);
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const task = await TaskRepository.findById(id);
      if (!task) throw new NotFoundError('Task not found');
      const tags = await TaskRepository.getTagsForTask(id);
      ApiResponseHelper.success(res, { ...task, tags });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & AuthRequest).user!;
      const projectId = req.params.projectId as string;
      const task = await TaskRepository.create({ ...req.body, project_id: projectId, created_by: user.userId });
      await ActivityRepository.create({ project_id: projectId, task_id: task.id, user_id: user.userId, action: 'TASK_CREATED', details: { title: task.title } });
      if (task.assigned_to && task.assigned_to !== user.userId) {
        await NotificationRepository.create({ user_id: task.assigned_to, type: 'TASK_ASSIGNED', title: 'New Task Assigned', message: `You have been assigned "${task.title}"`, reference_id: task.id });
      }
      ApiResponseHelper.created(res, task);
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & AuthRequest).user!;
      const id = req.params.id as string;
      const existing = await TaskRepository.findById(id);
      if (!existing) throw new NotFoundError('Task not found');

      const task = await TaskRepository.update(id, req.body);
      if (!task) throw new NotFoundError('Task not found');

      if (req.body.status && req.body.status !== existing.status) {
        await ActivityRepository.create({ project_id: task.project_id, task_id: task.id, user_id: user.userId, action: 'TASK_STATUS_CHANGED', details: { from: existing.status, to: req.body.status } });
        if (existing.assigned_to && existing.assigned_to !== user.userId) {
          await NotificationRepository.create({ user_id: existing.assigned_to, type: 'TASK_STATUS_CHANGED', title: 'Task Status Changed', message: `"${task.title}" moved to ${req.body.status}`, reference_id: task.id });
        }
      }

      if (req.body.assigned_to && req.body.assigned_to !== existing.assigned_to) {
        await ActivityRepository.create({ project_id: task.project_id, task_id: task.id, user_id: user.userId, action: 'TASK_ASSIGNED', details: { assignedTo: req.body.assigned_to } });
        if (req.body.assigned_to !== user.userId) {
          await NotificationRepository.create({ user_id: req.body.assigned_to, type: 'TASK_ASSIGNED', title: 'Task Assigned', message: `You have been assigned "${task.title}"`, reference_id: task.id });
        }
      }

      if (req.body.tags) await TaskRepository.setTags(task.id, req.body.tags);
      ApiResponseHelper.success(res, task, 'Task updated');
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const task = await TaskRepository.findById(id);
      if (!task) throw new NotFoundError('Task not found');
      await TaskRepository.delete(id);
      ApiResponseHelper.success(res, null, 'Task deleted');
    } catch (error) { next(error); }
  }

  static async getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & AuthRequest).user!;
      const stats = await TaskRepository.getDashboardStats(user.userId);
      const recentActivity = await ActivityRepository.getRecent(user.userId);
      ApiResponseHelper.success(res, { ...stats, recentActivity });
    } catch (error) { next(error); }
  }
}

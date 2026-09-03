import { Request, Response, NextFunction } from 'express';
import { CommentRepository } from '../repositories/comment.repository';
import { ActivityRepository } from '../repositories/activity.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { TaskRepository } from '../repositories/task.repository';
import { ApiResponseHelper } from '../utils/response';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { AuthRequest } from '../types';

export class CommentController {
  static async getByTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = req.params.taskId as string;
      const comments = await CommentRepository.findByTask(taskId);
      ApiResponseHelper.success(res, comments);
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & AuthRequest).user!;
      const taskId = req.params.taskId as string;
      const comment = await CommentRepository.create({ task_id: taskId, user_id: user.userId, content: req.body.content as string });
      const task = await TaskRepository.findById(taskId);
      if (task) {
        await ActivityRepository.create({ project_id: task.project_id, task_id: task.id, user_id: user.userId, action: 'COMMENT_ADDED', details: { preview: (req.body.content as string).substring(0, 100) } });
        if (task.assigned_to && task.assigned_to !== user.userId) {
          await NotificationRepository.create({ user_id: task.assigned_to, type: 'COMMENT_ADDED', title: 'New Comment', message: `New comment on "${task.title}"`, reference_id: task.id });
        }
      }
      ApiResponseHelper.created(res, comment);
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & AuthRequest).user!;
      const id = req.params.id as string;
      const comment = await CommentRepository.findById(id);
      if (!comment) throw new NotFoundError('Comment not found');
      if (comment.user_id !== user.userId) throw new ForbiddenError('You can only edit your own comments');
      const updated = await CommentRepository.update(id, req.body.content as string);
      ApiResponseHelper.success(res, updated, 'Comment updated');
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & AuthRequest).user!;
      const id = req.params.id as string;
      const comment = await CommentRepository.findById(id);
      if (!comment) throw new NotFoundError('Comment not found');
      if (comment.user_id !== user.userId && user.role !== 'ADMIN') throw new ForbiddenError('You can only delete your own comments');
      await CommentRepository.delete(id);
      ApiResponseHelper.success(res, null, 'Comment deleted');
    } catch (error) { next(error); }
  }
}

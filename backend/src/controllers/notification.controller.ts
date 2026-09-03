import { Request, Response, NextFunction } from 'express';
import { NotificationRepository } from '../repositories/notification.repository';
import { ApiResponseHelper } from '../utils/response';
import { AuthRequest } from '../types';

export class NotificationController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & AuthRequest).user!;
      const notifications = await NotificationRepository.findByUser(user.userId);
      const unreadCount = await NotificationRepository.getUnreadCount(user.userId);
      ApiResponseHelper.success(res, { notifications, unreadCount });
    } catch (error) { next(error); }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await NotificationRepository.markAsRead(id);
      ApiResponseHelper.success(res, null, 'Notification marked as read');
    } catch (error) { next(error); }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & AuthRequest).user!;
      await NotificationRepository.markAllAsRead(user.userId);
      ApiResponseHelper.success(res, null, 'All notifications marked as read');
    } catch (error) { next(error); }
  }
}

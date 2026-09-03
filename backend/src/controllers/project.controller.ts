import { Request, Response, NextFunction } from 'express';
import { ProjectRepository } from '../repositories/project.repository';
import { ActivityRepository } from '../repositories/activity.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { ApiResponseHelper } from '../utils/response';
import { NotFoundError } from '../utils/errors';
import { AuthRequest, UserRole } from '../types';

export class ProjectController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & AuthRequest).user!;
      const { status, priority } = req.query;
      const filters: { status?: string; priority?: string; userId?: string } = {};
      if (status) filters.status = status as string;
      if (priority) filters.priority = priority as string;
      if (user.role !== UserRole.ADMIN) filters.userId = user.userId;
      const projects = await ProjectRepository.findAll(filters);
      ApiResponseHelper.success(res, projects);
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const project = await ProjectRepository.findById(id);
      if (!project) throw new NotFoundError('Project not found');
      ApiResponseHelper.success(res, project);
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & AuthRequest).user!;
      const project = await ProjectRepository.create({ ...req.body, created_by: user.userId });
      await ProjectRepository.addMember(project.id, user.userId, user.role);
      await ActivityRepository.create({ project_id: project.id, user_id: user.userId, action: 'PROJECT_CREATED', details: { name: project.name } });
      ApiResponseHelper.created(res, project);
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & AuthRequest).user!;
      const id = req.params.id as string;
      const project = await ProjectRepository.update(id, req.body);
      if (!project) throw new NotFoundError('Project not found');
      await ActivityRepository.create({ project_id: project.id, user_id: user.userId, action: 'PROJECT_UPDATED', details: req.body });
      ApiResponseHelper.success(res, project, 'Project updated');
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const project = await ProjectRepository.findById(id);
      if (!project) throw new NotFoundError('Project not found');
      await ProjectRepository.delete(id);
      ApiResponseHelper.success(res, null, 'Project deleted');
    } catch (error) { next(error); }
  }

  static async getMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const members = await ProjectRepository.getMembers(id);
      ApiResponseHelper.success(res, members);
    } catch (error) { next(error); }
  }

  static async addMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & AuthRequest).user!;
      const projectId = req.params.id as string;
      const { userId, role } = req.body;
      await ProjectRepository.addMember(projectId, userId as string, (role as string) || 'DEVELOPER');
      await ActivityRepository.create({ project_id: projectId, user_id: user.userId, action: 'MEMBER_ADDED', details: { addedUserId: userId } });
      await NotificationRepository.create({ user_id: userId as string, type: 'PROJECT_ADDED', title: 'Added to Project', message: 'You have been added to a project', reference_id: projectId });
      ApiResponseHelper.created(res, null, 'Member added');
    } catch (error) { next(error); }
  }

  static async removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & AuthRequest).user!;
      const projectId = req.params.id as string;
      const userId = req.params.userId as string;
      await ProjectRepository.removeMember(projectId, userId);
      await ActivityRepository.create({ project_id: projectId, user_id: user.userId, action: 'MEMBER_REMOVED', details: { removedUserId: userId } });
      ApiResponseHelper.success(res, null, 'Member removed');
    } catch (error) { next(error); }
  }

  static async getActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const activity = await ActivityRepository.findByProject(id);
      ApiResponseHelper.success(res, activity);
    } catch (error) { next(error); }
  }
}

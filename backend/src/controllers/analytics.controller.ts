import { Request, Response, NextFunction } from 'express';
import db from '../config/database';
import { ApiResponseHelper } from '../utils/response';
import { NotFoundError } from '../utils/errors';

export class AnalyticsController {
  static async getProjectAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = req.params.id;
      const project = await db('projects').where({ id: projectId }).first();
      if (!project) throw new NotFoundError('Project not found');

      const tasksByStatus = await db('tasks').select('status').count('id as count').where({ project_id: projectId }).groupBy('status');
      const tasksByPriority = await db('tasks').select('priority').count('id as count').where({ project_id: projectId }).groupBy('priority');
      const tasksByDeveloper = await db('tasks')
        .leftJoin('users', 'tasks.assigned_to', 'users.id')
        .select(
          db.raw("COALESCE(CONCAT(users.first_name, ' ', users.last_name), 'Unassigned') as name"),
          db.raw("COUNT(tasks.id) as count"),
          db.raw("SUM(CASE WHEN tasks.status = 'DONE' THEN 1 ELSE 0 END) as completed")
        )
        .where('tasks.project_id', projectId)
        .groupBy('users.id', 'users.first_name', 'users.last_name');

      const totalTasks = await db('tasks').where({ project_id: projectId }).count('id as count').first();
      const doneTasks = await db('tasks').where({ project_id: projectId, status: 'DONE' }).count('id as count').first();
      const overdueTasks = await db('tasks').where({ project_id: projectId }).whereNot('status', 'DONE').where('due_date', '<', new Date()).count('id as count').first();

      const total = Number(totalTasks?.count || 0);
      const done = Number(doneTasks?.count || 0);
      const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

      ApiResponseHelper.success(res, {
        tasksByStatus: tasksByStatus.map(r => ({ status: r.status, count: Number(r.count) })),
        tasksByPriority: tasksByPriority.map(r => ({ priority: r.priority, count: Number(r.count) })),
        tasksByDeveloper: tasksByDeveloper.map(r => ({ name: r.name, count: Number(r.count), completed: Number(r.completed || 0) })),
        completionRate,
        overdueCount: Number(overdueTasks?.count || 0),
        totalTasks: total,
        completedTasks: done,
      });
    } catch (error) { next(error); }
  }
}

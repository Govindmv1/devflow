import db from '../config/database';
import { v4 as uuid } from 'uuid';

/** Repository for activity logs */
export class ActivityRepository {
  static async findById(id: string) {
    return db('activity_logs').where({ id }).first();
  }

  static async create(data: { project_id: string; task_id?: string; user_id: string; action: string; details?: object }) {
    const id = uuid();
    await db('activity_logs').insert({
      id,
      ...data,
      details: data.details ? JSON.stringify(data.details) : null,
    });
    return (await this.findById(id))!;
  }

  static async findByProject(projectId: string, limit = 20) {
    return db('activity_logs')
      .join('users', 'users.id', 'activity_logs.user_id')
      .select('activity_logs.*', 'users.first_name', 'users.last_name', 'users.avatar_url')
      .where('activity_logs.project_id', projectId)
      .orderBy('activity_logs.created_at', 'desc')
      .limit(limit);
  }

  static async getRecent(userId: string, limit = 10) {
    return db('activity_logs')
      .join('users', 'users.id', 'activity_logs.user_id')
      .join('projects', 'projects.id', 'activity_logs.project_id')
      .select('activity_logs.*', 'users.first_name', 'users.last_name', 'projects.name as project_name')
      .whereIn('activity_logs.project_id', db('project_members').select('project_id').where('user_id', userId))
      .orderBy('activity_logs.created_at', 'desc')
      .limit(limit);
  }
}

import db from '../config/database';
import { Project } from '../types';
import { v4 as uuid } from 'uuid';

/** Repository for project database operations */
export class ProjectRepository {
  static async findAll(filters?: { status?: string; priority?: string; userId?: string }): Promise<Project[]> {
    const query = db('projects').select('projects.*')
      .select(db.raw('(SELECT COUNT(*) FROM project_members WHERE project_members.project_id = projects.id) as member_count'))
      .select(db.raw('(SELECT COUNT(*) FROM tasks WHERE tasks.project_id = projects.id) as task_count'))
      .select(db.raw("(SELECT COUNT(*) FROM tasks WHERE tasks.project_id = projects.id AND tasks.status = 'DONE') as completed_task_count"));

    if (filters?.status) query.where('projects.status', filters.status);
    if (filters?.priority) query.where('projects.priority', filters.priority);
    if (filters?.userId) {
      query.whereIn('projects.id', db('project_members').select('project_id').where('user_id', filters.userId));
    }
    return query.orderBy('projects.updated_at', 'desc');
  }

  static async findById(id: string): Promise<Project | undefined> {
    return db('projects').select('projects.*')
      .select(db.raw('(SELECT COUNT(*) FROM project_members WHERE project_members.project_id = projects.id) as member_count'))
      .select(db.raw('(SELECT COUNT(*) FROM tasks WHERE tasks.project_id = projects.id) as task_count'))
      .select(db.raw("(SELECT COUNT(*) FROM tasks WHERE tasks.project_id = projects.id AND tasks.status = 'DONE') as completed_task_count"))
      .where('projects.id', id).first();
  }

  static async create(data: Partial<Project>): Promise<Project> {
    const id = uuid();
    await db('projects').insert({ ...data, id });
    return (await this.findById(id))!;
  }

  static async update(id: string, data: Partial<Project>): Promise<Project | undefined> {
    await db('projects').where({ id }).update({ ...data, updated_at: db.fn.now() });
    return this.findById(id);
  }

  static async delete(id: string): Promise<void> {
    await db('projects').where({ id }).del();
  }

  static async addMember(projectId: string, userId: string, role: string): Promise<void> {
    const existing = await db('project_members').where({ project_id: projectId, user_id: userId }).first();
    if (!existing) {
      await db('project_members').insert({ id: uuid(), project_id: projectId, user_id: userId, role });
    }
  }

  static async removeMember(projectId: string, userId: string): Promise<void> {
    await db('project_members').where({ project_id: projectId, user_id: userId }).del();
  }

  static async getMembers(projectId: string): Promise<any[]> {
    return db('project_members')
      .join('users', 'users.id', 'project_members.user_id')
      .select(
        'project_members.*',
        'users.first_name', 'users.last_name', 'users.email', 'users.avatar_url',
        db.raw('(SELECT COUNT(*) FROM tasks WHERE tasks.assigned_to = project_members.user_id AND tasks.project_id = project_members.project_id) as assigned_tasks'),
        db.raw("(SELECT COUNT(*) FROM tasks WHERE tasks.assigned_to = project_members.user_id AND tasks.project_id = project_members.project_id AND tasks.status = 'DONE') as completed_tasks")
      )
      .where('project_members.project_id', projectId);
  }

  static async isMember(projectId: string, userId: string): Promise<boolean> {
    const member = await db('project_members').where({ project_id: projectId, user_id: userId }).first();
    return !!member;
  }
}

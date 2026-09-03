import db from '../config/database';
import { Task } from '../types';
import { v4 as uuid } from 'uuid';

/** Helper to convert flat joined row into nested assignee/creator/project objects */
function formatTaskRow(row: any): any {
  if (!row) return row;
  const task: any = { ...row };

  // Build assignee object from flat columns
  if (row.assignee_id) {
    task.assignee = {
      id: row.assignee_id,
      first_name: row.assignee_first_name,
      last_name: row.assignee_last_name,
      email: row.assignee_email || undefined,
      avatar_url: row.assignee_avatar_url || undefined,
    };
  } else {
    task.assignee = null;
  }

  // Build creator object
  if (row.creator_id) {
    task.creator = {
      id: row.creator_id,
      first_name: row.creator_first_name,
      last_name: row.creator_last_name,
    };
  }

  // Build project object
  if (row.project_name) {
    task.project = {
      id: row.project_id,
      name: row.project_name,
    };
  }

  // Clean up flat columns
  delete task.assignee_id; delete task.assignee_first_name; delete task.assignee_last_name;
  delete task.assignee_email; delete task.assignee_avatar_url;
  delete task.creator_id; delete task.creator_first_name; delete task.creator_last_name;
  delete task.project_name;

  // Ensure counts are numbers
  task.comment_count = Number(task.comment_count || 0);

  return task;
}

/** Repository for task database operations */
export class TaskRepository {
  static async findByProject(projectId: string, filters?: { status?: string; priority?: string; assignee?: string; search?: string }): Promise<Task[]> {
    const query = db('tasks')
      .leftJoin('users as assignee', 'tasks.assigned_to', 'assignee.id')
      .leftJoin('users as creator', 'tasks.created_by', 'creator.id')
      .select(
        'tasks.*',
        'assignee.id as assignee_id', 'assignee.first_name as assignee_first_name',
        'assignee.last_name as assignee_last_name', 'assignee.email as assignee_email',
        'assignee.avatar_url as assignee_avatar_url',
        'creator.id as creator_id', 'creator.first_name as creator_first_name',
        'creator.last_name as creator_last_name',
        db.raw('(SELECT COUNT(*) FROM comments WHERE comments.task_id = tasks.id) as comment_count')
      )
      .where('tasks.project_id', projectId);

    if (filters?.status) query.where('tasks.status', filters.status);
    if (filters?.priority) query.where('tasks.priority', filters.priority);
    if (filters?.assignee) query.where('tasks.assigned_to', filters.assignee);
    if (filters?.search) query.where(function () { this.where('tasks.title', 'like', `%${filters.search}%`).orWhere('tasks.description', 'like', `%${filters.search}%`); });

    const rows = await query.orderBy('tasks.updated_at', 'desc');
    return rows.map(formatTaskRow);
  }

  static async findById(id: string): Promise<Task | undefined> {
    const row = await db('tasks')
      .leftJoin('users as assignee', 'tasks.assigned_to', 'assignee.id')
      .leftJoin('users as creator', 'tasks.created_by', 'creator.id')
      .leftJoin('projects', 'tasks.project_id', 'projects.id')
      .select(
        'tasks.*',
        'assignee.id as assignee_id', 'assignee.first_name as assignee_first_name',
        'assignee.last_name as assignee_last_name', 'assignee.email as assignee_email',
        'assignee.avatar_url as assignee_avatar_url',
        'creator.id as creator_id', 'creator.first_name as creator_first_name',
        'creator.last_name as creator_last_name',
        'projects.name as project_name',
        db.raw('(SELECT COUNT(*) FROM comments WHERE comments.task_id = tasks.id) as comment_count')
      )
      .where('tasks.id', id).first();
    return formatTaskRow(row);
  }

  static async findAllForUser(userId: string, filters?: { status?: string; priority?: string; search?: string }): Promise<Task[]> {
    const query = db('tasks')
      .leftJoin('users as assignee', 'tasks.assigned_to', 'assignee.id')
      .leftJoin('projects', 'tasks.project_id', 'projects.id')
      .select(
        'tasks.*',
        'assignee.id as assignee_id', 'assignee.first_name as assignee_first_name',
        'assignee.last_name as assignee_last_name',
        'projects.name as project_name',
        db.raw('(SELECT COUNT(*) FROM comments WHERE comments.task_id = tasks.id) as comment_count')
      )
      .where('tasks.assigned_to', userId);
    if (filters?.status) query.where('tasks.status', filters.status);
    if (filters?.priority) query.where('tasks.priority', filters.priority);
    if (filters?.search) query.where('tasks.title', 'like', `%${filters.search}%`);
    const rows = await query.orderBy('tasks.updated_at', 'desc');
    return rows.map(formatTaskRow);
  }

  static async create(data: Partial<Task>): Promise<Task> {
    const id = uuid();
    await db('tasks').insert({ ...data, id });
    return (await this.findById(id))!;
  }

  static async update(id: string, data: Partial<Task>): Promise<Task | undefined> {
    await db('tasks').where({ id }).update({ ...data, updated_at: db.fn.now() });
    return this.findById(id);
  }

  static async delete(id: string): Promise<void> {
    await db('tasks').where({ id }).del();
  }

  static async getTagsForTask(taskId: string): Promise<any[]> {
    return db('task_tags').join('tags', 'tags.id', 'task_tags.tag_id').where('task_tags.task_id', taskId).select('tags.*');
  }

  static async setTags(taskId: string, tagIds: string[]): Promise<void> {
    await db('task_tags').where({ task_id: taskId }).del();
    if (tagIds.length > 0) {
      await db('task_tags').insert(tagIds.map(tagId => ({ task_id: taskId, tag_id: tagId })));
    }
  }

  static async getDashboardStats(userId?: string): Promise<any> {
    const totalProjects = await db('projects').count('id as count').first();
    const activeProjects = await db('projects').where('status', 'ACTIVE').count('id as count').first();
    const completedProjects = await db('projects').where('status', 'COMPLETED').count('id as count').first();
    const totalTasks = await db('tasks').count('id as count').first();
    const completedTasks = await db('tasks').where('status', 'DONE').count('id as count').first();
    const pendingTasks = await db('tasks').whereNot('status', 'DONE').count('id as count').first();
    const overdueTasks = await db('tasks').whereNot('status', 'DONE').where('due_date', '<', new Date()).count('id as count').first();
    const myTasks = userId ? await db('tasks').where('assigned_to', userId).whereNot('status', 'DONE').count('id as count').first() : { count: 0 };

    return {
      totalProjects: Number(totalProjects?.count || 0),
      activeProjects: Number(activeProjects?.count || 0),
      completedProjects: Number(completedProjects?.count || 0),
      totalTasks: Number(totalTasks?.count || 0),
      completedTasks: Number(completedTasks?.count || 0),
      pendingTasks: Number(pendingTasks?.count || 0),
      overdueTasks: Number(overdueTasks?.count || 0),
      myTasks: Number(myTasks?.count || 0),
    };
  }
}

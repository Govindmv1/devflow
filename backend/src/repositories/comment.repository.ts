import db from '../config/database';
import { v4 as uuid } from 'uuid';

/** Repository for comments */
export class CommentRepository {
  static async findByTask(taskId: string) {
    return db('comments')
      .join('users', 'users.id', 'comments.user_id')
      .select('comments.*', 'users.first_name', 'users.last_name', 'users.email', 'users.avatar_url')
      .where('comments.task_id', taskId)
      .orderBy('comments.created_at', 'asc');
  }

  static async findById(id: string) {
    return db('comments').where({ id }).first();
  }

  static async create(data: { task_id: string; user_id: string; content: string }) {
    const id = uuid();
    await db('comments').insert({
      ...data,
      id
    });
    return (await this.findById(id))!;
  }

  static async update(id: string, content: string) {
    await db('comments').where({ id }).update({ content, updated_at: db.fn.now() });
    return this.findById(id);
  }

  static async delete(id: string) {
    await db('comments').where({ id }).del();
  }
}

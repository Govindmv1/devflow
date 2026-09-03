import db from '../config/database';
import { v4 as uuid } from 'uuid';

/** Repository for notifications */
export class NotificationRepository {
  static async findByUser(userId: string) {
    return db('notifications').where({ user_id: userId }).orderBy('created_at', 'desc').limit(50);
  }

  static async findById(id: string) {
    return db('notifications').where({ id }).first();
  }

  static async create(data: { user_id: string; type: string; title: string; message: string; reference_id?: string }) {
    const id = uuid();
    await db('notifications').insert({
      ...data,
      id
    });
    return (await this.findById(id))!;
  }

  static async markAsRead(id: string) {
    await db('notifications').where({ id }).update({ is_read: true });
  }

  static async markAllAsRead(userId: string) {
    await db('notifications').where({ user_id: userId, is_read: false }).update({ is_read: true });
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const result = await db('notifications').where({ user_id: userId, is_read: false }).count('id as count').first();
    return Number(result?.count || 0);
  }
}

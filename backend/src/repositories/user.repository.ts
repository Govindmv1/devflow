import db from '../config/database';
import { User, SafeUser } from '../types';
import { v4 as uuid } from 'uuid';

/**
 * User Repository - handles all database operations for users.
 * This layer is the ONLY code that touches the database directly.
 */
export class UserRepository {
  static async findByEmail(email: string): Promise<User | undefined> {
    return db('users').where({ email }).first();
  }

  static async findById(id: string): Promise<SafeUser | undefined> {
    return db('users')
      .select('id', 'email', 'first_name', 'last_name', 'role', 'avatar_url', 'is_active', 'created_at', 'updated_at')
      .where({ id })
      .first();
  }

  static async findByIdWithPassword(id: string): Promise<User | undefined> {
    return db('users').where({ id }).first();
  }

  static async create(data: Partial<User>): Promise<SafeUser> {
    const id = data.id || uuid();
    await db('users').insert({
      ...data,
      id
    });
    return (await this.findById(id))!;
  }

  static async update(id: string, data: Partial<User>): Promise<SafeUser | undefined> {
    await db('users')
      .where({ id })
      .update({ ...data, updated_at: db.fn.now() });
    return this.findById(id);
  }

  static async findAll(): Promise<SafeUser[]> {
    return db('users')
      .select('id', 'email', 'first_name', 'last_name', 'role', 'avatar_url', 'is_active', 'created_at', 'updated_at')
      .orderBy('created_at', 'desc');
  }

  static async deactivate(id: string): Promise<void> {
    await db('users').where({ id }).update({ is_active: false, updated_at: db.fn.now() });
  }

  static async activate(id: string): Promise<void> {
    await db('users').where({ id }).update({ is_active: true, updated_at: db.fn.now() });
  }
}

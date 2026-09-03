import db from '../config/database';
import { RefreshToken } from '../types';
import { v4 as uuid } from 'uuid';

/** Repository for refresh token management */
export class TokenRepository {
  static async create(userId: string, token: string, expiresAt: Date): Promise<void> {
    await db('refresh_tokens').insert({
      id: uuid(),
      user_id: userId,
      token,
      expires_at: expiresAt
    });
  }

  static async findByToken(token: string): Promise<RefreshToken | undefined> {
    return db('refresh_tokens').where({ token }).first();
  }

  static async deleteByToken(token: string): Promise<void> {
    await db('refresh_tokens').where({ token }).del();
  }

  static async deleteByUserId(userId: string): Promise<void> {
    await db('refresh_tokens').where({ user_id: userId }).del();
  }

  static async deleteExpired(): Promise<void> {
    await db('refresh_tokens').where('expires_at', '<', new Date()).del();
  }
}

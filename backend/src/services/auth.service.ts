import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config';
import { UserRepository } from '../repositories/user.repository';
import { TokenRepository } from '../repositories/token.repository';
import { SafeUser, JwtPayload, UserRole } from '../types';
import { UnauthorizedError, ConflictError, BadRequestError, NotFoundError } from '../utils/errors';

/**
 * Authentication service - handles business logic for auth flows.
 * This layer sits between controllers and repositories.
 */
export class AuthService {
  /** Register a new user */
  static async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: UserRole;
  }): Promise<{ user: SafeUser; accessToken: string; refreshToken: string }> {
    // Check if email is already taken
    const existing = await UserRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email is already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(data.password, salt);

    // Create user (default role is DEVELOPER)
    const user = await UserRepository.create({
      email: data.email,
      password_hash,
      first_name: data.first_name,
      last_name: data.last_name,
      role: data.role || UserRole.DEVELOPER,
    });

    // Generate tokens
    const accessToken = AuthService.generateAccessToken(user);
    const refreshToken = await AuthService.generateRefreshToken(user.id);

    return { user, accessToken, refreshToken };
  }

  /** Login with email and password */
  static async login(email: string, password: string): Promise<{ user: SafeUser; accessToken: string; refreshToken: string }> {
    const userWithPassword = await UserRepository.findByEmail(email);
    if (!userWithPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!userWithPassword.is_active) {
      throw new UnauthorizedError('Account is deactivated');
    }

    const isMatch = await bcrypt.compare(password, userWithPassword.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Get safe user (without password hash)
    const user = await UserRepository.findById(userWithPassword.id);
    if (!user) throw new NotFoundError('User not found');

    const accessToken = AuthService.generateAccessToken(user);
    const refreshToken = await AuthService.generateRefreshToken(user.id);

    return { user, accessToken, refreshToken };
  }

  /** Refresh the access token using a valid refresh token */
  static async refresh(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const storedToken = await TokenRepository.findByToken(token);
    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (new Date(storedToken.expires_at) < new Date()) {
      await TokenRepository.deleteByToken(token);
      throw new UnauthorizedError('Refresh token expired');
    }

    const user = await UserRepository.findById(storedToken.user_id);
    if (!user) throw new UnauthorizedError('User not found');

    // Rotate refresh token (delete old, create new)
    await TokenRepository.deleteByToken(token);
    const accessToken = AuthService.generateAccessToken(user);
    const refreshToken = await AuthService.generateRefreshToken(user.id);

    return { accessToken, refreshToken };
  }

  /** Logout - invalidate refresh token */
  static async logout(refreshToken?: string, userId?: string): Promise<void> {
    if (refreshToken) {
      await TokenRepository.deleteByToken(refreshToken);
    }
    if (userId) {
      await TokenRepository.deleteByUserId(userId);
    }
  }

  /** Generate a short-lived JWT access token */
  private static generateAccessToken(user: SafeUser): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    return jwt.sign({ ...payload }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
  }

  /** Generate and persist a refresh token */
  private static async generateRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    await TokenRepository.create(userId, token, expiresAt);
    return token;
  }
}

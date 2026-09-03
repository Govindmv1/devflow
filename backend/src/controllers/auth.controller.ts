import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { UserRepository } from '../repositories/user.repository';
import { ApiResponseHelper } from '../utils/response';
import { AuthRequest } from '../types';

/**
 * Auth controller - handles HTTP request/response for authentication.
 * Each method corresponds to an API endpoint.
 */
export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body);
      ApiResponseHelper.created(res, result, 'Registration successful');
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      ApiResponseHelper.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refresh(refreshToken);
      ApiResponseHelper.success(res, result, 'Token refreshed');
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & AuthRequest).user;
      const { refreshToken } = req.body;
      await AuthService.logout(refreshToken, user?.userId);
      ApiResponseHelper.success(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & AuthRequest).user;
      if (!user) {
        ApiResponseHelper.error(res, 'Unauthorized', 401);
        return;
      }
      const profile = await UserRepository.findById(user.userId);
      ApiResponseHelper.success(res, profile);
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await UserRepository.findAll();
      ApiResponseHelper.success(res, users);
    } catch (error) {
      next(error);
    }
  }
}

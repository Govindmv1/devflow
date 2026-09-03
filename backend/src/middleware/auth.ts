import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config';
import { JwtPayload, UserRole, AuthRequest } from '../types';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

/**
 * Authentication middleware.
 * Extracts and verifies the JWT from the Authorization header.
 * Attaches the decoded user payload to req.user for downstream handlers.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    (req as Request & AuthRequest).user = decoded;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
      return;
    }
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

/**
 * Role-based authorization middleware factory.
 * Returns middleware that checks if the authenticated user has one of the allowed roles.
 * Must be used AFTER the authenticate middleware.
 * 
 * Usage: authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = (req as Request & AuthRequest).user;

    if (!user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      next(new ForbiddenError('You do not have permission to perform this action'));
      return;
    }

    next();
  };
}

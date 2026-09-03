import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { env } from '../config';

/**
 * Centralized error handling middleware.
 * This catches all errors thrown in route handlers and formats them
 * into consistent API responses. Must be registered LAST in Express middleware chain.
 * 
 * Design Decision: We distinguish between "operational" errors (expected, like
 * validation failures) and "programmer" errors (unexpected bugs). Only operational
 * errors show their message to the client.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the error
  if (err instanceof AppError && err.isOperational) {
    logger.warn(`Operational error: ${err.message}`, { statusCode: err.statusCode });
  } else {
    logger.error(`Unexpected error: ${err.message}`, { stack: err.stack });
  }

  // Handle known application errors
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Unknown errors - don't leak details in production
  const message = env.IS_PRODUCTION ? 'Internal server error' : err.message;
  res.status(500).json({
    success: false,
    message,
    ...(env.IS_PRODUCTION ? {} : { stack: err.stack }),
  });
}

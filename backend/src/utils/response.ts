import { Response } from 'express';
import { ApiResponse, PaginationInfo } from '../types';

/**
 * Standardized API response helpers.
 * Every API endpoint should use these to ensure consistent response format.
 */
export class ApiResponseHelper {
  static success<T>(res: Response, data: T, message?: string, statusCode = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message = 'Created successfully'): Response {
    return ApiResponseHelper.success(res, data, message, 201);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationInfo,
    message?: string
  ): Response {
    const response: ApiResponse<T[]> = {
      success: true,
      data,
      pagination,
      message,
    };
    return res.status(200).json(response);
  }

  static error(res: Response, message: string, statusCode = 500, error?: string): Response {
    const response: ApiResponse = {
      success: false,
      message,
      error,
    };
    return res.status(statusCode).json(response);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}

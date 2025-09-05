import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { config } from '@/config/config';
import { ValidationError, DatabaseError } from 'sequelize';

export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error handler middleware
 */
export const errorHandler = (
    error: AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';
    let details: any = {};

    // Handle Sequelize errors
    if (error instanceof ValidationError) {
        statusCode = 400;
        message = 'Validation failed';
        details = error.errors.map(err => ({
            field: err.path,
            message: err.message
        }));
    }

    if (error instanceof DatabaseError) {
        statusCode = 400;
        message = 'Database operation failed';
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
    }

    // Log error
    logger.error('Error occurred:', {
        message: error.message,
        stack: error.stack,
        statusCode,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        adminId: (req as any).admin?.id
    });

    // Send error response
    const errorResponse: any = {
        error: getErrorType(statusCode),
        message,
        timestamp: new Date().toISOString(),
        path: req.originalUrl
    };

    // Add details in development
    if (config.nodeEnv === 'development') {
        errorResponse.details = details;
        errorResponse.stack = error.stack;
    }

    // Add request ID if available
    if ((req as any).requestId) {
        errorResponse.requestId = (req as any).requestId;
    }

    res.status(statusCode).json(errorResponse);
};

/**
 * Handle async errors
 */
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Create validation error
 */
export const createValidationError = (message: string, field?: string): CustomError => {
    const error = new CustomError(message, 400);
    error.name = 'ValidationError';
    return error;
};

/**
 * Create not found error
 */
export const createNotFoundError = (resource: string): CustomError => {
    return new CustomError(`${resource} not found`, 404);
};

/**
 * Create unauthorized error
 */
export const createUnauthorizedError = (message: string = 'Unauthorized'): CustomError => {
    return new CustomError(message, 401);
};

/**
 * Create forbidden error
 */
export const createForbiddenError = (message: string = 'Forbidden'): CustomError => {
    return new CustomError(message, 403);
};

/**
 * Create conflict error
 */
export const createConflictError = (message: string): CustomError => {
    return new CustomError(message, 409);
};

/**
 * Get error type based on status code
 */
function getErrorType(statusCode: number): string {
    switch (statusCode) {
        case 400:
            return 'Bad Request';
        case 401:
            return 'Unauthorized';
        case 403:
            return 'Forbidden';
        case 404:
            return 'Not Found';
        case 409:
            return 'Conflict';
        case 422:
            return 'Unprocessable Entity';
        case 429:
            return 'Too Many Requests';
        case 500:
            return 'Internal Server Error';
        default:
            return 'Error';
    }
}
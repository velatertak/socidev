import { ApiError } from '../utils/ApiError.js';
import logger from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Handle Stripe Errors
  if (err.type?.startsWith('Stripe')) {
    return res.status(400).json({
      status: 'error',
      message: 'Payment processing failed',
      error: err.message
    });
  }

  // Handle PayPal Errors
  if (err.name === 'PayPalError') {
    return res.status(400).json({
      status: 'error',
      message: 'Payment processing failed',
      error: err.message
    });
  }

  // Handle Web3/Crypto Errors
  if (err.message?.includes('insufficient funds') || err.message?.includes('gas required exceeds')) {
    return res.status(400).json({
      status: 'error',
      message: 'Crypto transaction failed',
      error: 'Insufficient funds for transaction'
    });
  }

  // Handle Bank Transfer Errors
  if (err.message?.includes('IBAN') || err.message?.includes('bank details')) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid bank details',
      error: err.message
    });
  }

  // Handle API Errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errors: err.errors
    });
  }

  // Handle Validation Errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors: err.errors
    });
  }

  // Handle Database Errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      status: 'error',
      message: 'Database Validation Error',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Handle JWT Errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token'
    });
  }

  // Default Error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message
  });
};
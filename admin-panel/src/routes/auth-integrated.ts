import { Router, Request, Response } from 'express';
import * as authUtils from '../utils/auth';
import { logger } from '../utils/logger';
import { asyncHandler } from '../middleware/errorHandler';
import { body, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import db from '@/models/index.js';

const { User } = db;

const router = Router();

/**
 * POST /api/auth/login
 * Admin login endpoint - integrated with main project database
 */
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).trim()
], asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid input data',
            details: errors.array()
        });
        return;
    }

    const { email, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    try {
        // Find admin by email in the main database
        // Users with role 'admin' or 'super_admin' can log in to the admin panel
        const user = await User.findOne({
            where: {
                email: email,
                role: {
                    [Op.in]: ['admin', 'super_admin']
                }
            }
        });

        if (!user) {
            logger.warn('Login attempt with invalid email or not admin', { email, ipAddress });
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid credentials or insufficient privileges'
            });
            return;
        }

        // Verify password using the admin panel's AuthUtils
        const isPasswordValid = await authUtils.AuthUtils.comparePassword(password, user.password);
        if (!isPasswordValid) {
            logger.warn('Login attempt with invalid password', {
                userId: user.id,
                email,
                ipAddress
            });
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid credentials'
            });
            return;
        }

        // Generate JWT token with admin data
        const token = authUtils.AuthUtils.generateToken({
            adminId: parseInt(user.id),  // Convert to number
            email: user.email,
            role: user.role?.toUpperCase() || 'ADMIN' // Use actual role
        });

        // Log successful login
        logger.info('Admin logged in successfully', {
            adminId: user.id,
            email: user.email,
            ipAddress,
            userAgent
        });

        // Return response
        res.json({
            message: 'Login successful',
            data: {
                admin: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role?.toUpperCase() || 'ADMIN' // Use actual role
                },
                token: token
            }
        });

    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Login failed'
        });
        return;
    }
}));

/**
 * POST /api/auth/logout
 * Admin logout endpoint
 */
router.post('/logout', asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // For now, we'll just return a success message
    // In a more complete implementation, we would invalidate the token
    res.json({
        message: 'Logout successful'
    });
}));

/**
 * GET /api/auth/me
 * Get current admin profile
 */
router.get('/me', asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'No token provided'
        });
        return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
        // Verify JWT token
        const payload: any = authUtils.AuthUtils.verifyToken(token);

        // Find user in the main database
        const user = await User.findByPk(parseInt(payload.adminId));  // Convert to number

        if (!user) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Admin not found'
            });
            return;
        }

        res.json({
            message: 'Admin profile retrieved',
            data: {
                admin: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role?.toUpperCase() || 'ADMIN' // Use actual role
                }
            }
        });
    } catch (error) {
        logger.error('Profile retrieval error:', error);
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid token'
        });
        return;
    }
}));

export { router as adminAuthIntegratedRoutes };
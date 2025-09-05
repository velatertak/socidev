import { Router, Request, Response } from 'express';
import { AuthUtils } from '@/utils/auth';
import { logger } from '@/utils/logger';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticateAdmin, AuthenticatedRequest } from '@/middleware/auth';
import { body, validationResult } from 'express-validator';
import { Admin } from '@/models/Admin.js';
import { AdminSession } from '@/models/AdminSession.js';
import { Op } from 'sequelize';

const router = Router();

/**
 * POST /api/auth/login
 * Admin login endpoint
 */
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).trim()
], asyncHandler(async (req: Request, res: Response) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid input data',
            details: errors.array()
        });
    }

    const { email, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    try {
        // Find admin by email
        const admin: any = await Admin.findOne({
            where: { email },
            attributes: ['id', 'email', 'username', 'firstName', 'lastName', 'password', 'role', 'isActive', 'profileImage', 'lastLogin']
        });

        if (!admin) {
            logger.warn('Login attempt with invalid email', { email, ipAddress });
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid credentials'
            });
        }

        if (!admin.isActive) {
            logger.warn('Login attempt with deactivated account', {
                adminId: admin.id,
                email,
                ipAddress
            });
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Account is deactivated'
            });
        }

        // Verify password
        const isPasswordValid = await AuthUtils.comparePassword(password, admin.password);
        if (!isPasswordValid) {
            logger.warn('Login attempt with invalid password', {
                adminId: admin.id,
                email,
                ipAddress
            });
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = AuthUtils.generateToken({
            adminId: admin.id,
            email: admin.email,
            role: admin.role
        });

        // Create session with the same JWT token
        const expiresAt = AuthUtils.getTokenExpiration();

        await AdminSession.create({
            adminId: admin.id,
            token: token,
            expiresAt,
            ipAddress,
            userAgent
        });

        // Update last login
        await Admin.update(
            { lastLogin: new Date() },
            { where: { id: admin.id } }
        );

        // Log successful login
        logger.info('Admin logged in successfully', {
            adminId: admin.id,
            email: admin.email,
            ipAddress,
            userAgent
        });

        // Return response
        res.json({
            message: 'Login successful',
            data: {
                admin: {
                    id: admin.id,
                    email: admin.email,
                    username: admin.username,
                    firstName: admin.firstName,
                    lastName: admin.lastName,
                    role: admin.role,
                    profileImage: admin.profileImage,
                    lastLogin: admin.lastLogin
                },
                token: token,
                expiresAt
            }
        });

    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Login failed'
        });
    }
}));

/**
 * POST /api/auth/logout
 * Admin logout endpoint
 */
router.post('/logout', authenticateAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7); // Remove 'Bearer ' prefix

    if (token && req.admin) {
        try {
            // Remove session
            await AdminSession.destroy({
                where: {
                    adminId: req.admin.id,
                    token
                }
            });

            logger.info('Admin logged out', {
                adminId: req.admin.id,
                email: req.admin.email,
                ipAddress: req.ip
            });
        } catch (error) {
            logger.error('Logout error:', error);
        }
    }

    res.json({
        message: 'Logout successful'
    });
}));

/**
 * GET /api/auth/me
 * Get current admin profile
 */
router.get('/me', authenticateAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.admin) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Admin not authenticated'
        });
    }

    const admin: any = await Admin.findOne({
        where: { id: req.admin.id },
        attributes: ['id', 'email', 'username', 'firstName', 'lastName', 'role', 'profileImage', 'lastLogin', 'createdAt']
    });

    res.json({
        message: 'Admin profile retrieved',
        data: { admin }
    });
}));

/**
 * PUT /api/auth/profile
 * Update admin profile
 */
router.put('/profile', authenticateAdmin, [
    body('firstName').optional().isLength({ min: 1 }).trim(),
    body('lastName').optional().isLength({ min: 1 }).trim(),
    body('username').optional().isLength({ min: 3 }).trim()
], asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid input data',
            details: errors.array()
        });
    }

    if (!req.admin) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Admin not authenticated'
        });
    }

    const { firstName, lastName, username } = req.body;

    try {
        // Check if username is already taken
        if (username) {
            const existingAdmin: any = await Admin.findOne({
                where: {
                    username,
                    id: { [Op.ne]: req.admin.id }
                }
            });

            if (existingAdmin) {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'Username already taken'
                });
            }
        }

        // Update admin profile
        await Admin.update(
            {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(username && { username })
            },
            {
                where: { id: req.admin.id }
            }
        );

        // Fetch updated admin data
        const updatedAdmin: any = await Admin.findOne({
            where: { id: req.admin.id },
            attributes: ['id', 'email', 'username', 'firstName', 'lastName', 'role', 'profileImage', 'lastLogin', 'createdAt']
        });

        logger.info('Admin profile updated', {
            adminId: req.admin.id,
            changes: { firstName, lastName, username }
        });

        res.json({
            message: 'Profile updated successfully',
            data: { admin: updatedAdmin }
        });

    } catch (error) {
        logger.error('Profile update error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update profile'
        });
    }
}));

/**
 * PUT /api/auth/change-password
 * Change admin password
 */
router.put('/change-password', authenticateAdmin, [
    body('currentPassword').isLength({ min: 6 }),
    body('newPassword').isLength({ min: 8 })
], asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid input data',
            details: errors.array()
        });
    }

    if (!req.admin) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Admin not authenticated'
        });
    }

    const { currentPassword, newPassword } = req.body;

    try {
        // Get current admin with password
        const admin: any = await Admin.findOne({
            where: { id: req.admin.id },
            attributes: ['password']
        });

        if (!admin) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Admin not found'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await AuthUtils.comparePassword(currentPassword, admin.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Current password is incorrect'
            });
        }

        // Validate new password
        const passwordValidation = AuthUtils.validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'New password does not meet requirements',
                details: passwordValidation.errors
            });
        }

        // Hash new password
        const hashedNewPassword = await AuthUtils.hashPassword(newPassword);

        // Update password
        await Admin.update(
            { password: hashedNewPassword },
            { where: { id: req.admin.id } }
        );

        // Invalidate all sessions except current one
        const authHeader = req.headers.authorization;
        const currentToken = authHeader?.substring(7);

        await AdminSession.destroy({
            where: {
                adminId: req.admin.id,
                token: { [Op.ne]: currentToken }
            }
        });

        logger.info('Admin password changed', {
            adminId: req.admin.id,
            email: req.admin.email
        });

        res.json({
            message: 'Password changed successfully'
        });

    } catch (error) {
        logger.error('Password change error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to change password'
        });
    }
}));

export { router as adminAuthRoutes };
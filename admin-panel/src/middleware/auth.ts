import { Request, Response, NextFunction } from 'express';
import { AuthUtils, JwtPayload } from '@/utils/auth';
import { logger } from '@/utils/logger';
import db from '@/models/index.js';
import { Op } from 'sequelize';
import { AdminAttributes } from '@/types/models';

const { Admin, AdminSession, AdminActivity } = db;

export interface AuthenticatedRequest extends Request {
    admin?: {
        id: number;
        email: string;
        role: string;
        firstName: string;
        lastName: string;
    };
}

/**
 * Middleware to authenticate admin users
 */
export const authenticateAdmin = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'No token provided'
            });
            return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify JWT token
        const payload: JwtPayload = AuthUtils.verifyToken(token);

        // Check if admin exists and is active
        const admin: AdminAttributes | null = await Admin.findOne({
            where: { id: payload.adminId },
            attributes: ['id', 'email', 'role', 'firstName', 'lastName', 'isActive']
        }) as unknown as AdminAttributes | null;

        if (!admin) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Admin not found'
            });
            return;
        }

        if (!admin.isActive) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Admin account is deactivated'
            });
            return;
        }

        // Check if session is valid
        const session: any = await AdminSession.findOne({
            where: {
                adminId: admin.id,
                token,
                expiresAt: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!session) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid or expired session'
            });
            return;
        }

        // Attach admin info to request
        req.admin = {
            id: admin.id,
            email: admin.email,
            role: admin.role,
            firstName: admin.firstName,
            lastName: admin.lastName
        };

        // Log admin activity
        logger.info('Admin authenticated', {
            adminId: admin.id,
            email: admin.email,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            method: req.method
        });

        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid token'
        });
        return;
    }
};

/**
 * Middleware to authorize admin users based on role
 */
export const authorizeRoles = (...roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.admin) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Admin not authenticated'
            });
            return;
        }

        if (!roles.includes(req.admin.role)) {
            logger.warn('Unauthorized access attempt', {
                adminId: req.admin.id,
                email: req.admin.email,
                role: req.admin.role,
                requiredRoles: roles,
                path: req.path,
                method: req.method,
                ip: req.ip
            });

            res.status(403).json({
                error: 'Forbidden',
                message: 'Insufficient permissions'
            });
            return;
        }

        next();
    };
};

/**
 * Middleware to log admin activities
 */
export const logAdminActivity = (action: string, resource: string) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        if (req.admin) {
            try {
                await AdminActivity.create({
                    adminId: req.admin.id,
                    action,
                    resource,
                    resourceId: req.params.id || null,
                    details: {
                        method: req.method,
                        path: req.path,
                        query: req.query,
                        body: req.method !== 'GET' ? req.body : undefined
                    },
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent')
                });
            } catch (error) {
                logger.error('Failed to log admin activity:', error);
            }
        }
        next();
    };
};

/**
 * Middleware to check if admin is super admin
 */
export const requireSuperAdmin = authorizeRoles('SUPER_ADMIN');

/**
 * Middleware to check if admin is super admin or admin
 */
export const requireAdminOrAbove = authorizeRoles('SUPER_ADMIN', 'ADMIN');

/**
 * Middleware to check if admin has any admin role
 */
export const requireAnyAdminRole = authorizeRoles('SUPER_ADMIN', 'ADMIN', 'MODERATOR');
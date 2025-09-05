import { Router } from 'express';
import { authenticateAdminIntegrated, AuthenticatedRequest as IntegratedAuthenticatedRequest } from '@/middleware/auth-integrated';
import { asyncHandler } from '@/middleware/errorHandler';
import { body, validationResult } from 'express-validator';
import { Admin } from '@/models/Admin.js';
import { User } from '@/models/User.js';
import { Order } from '@/models/Order.js';
import { Task } from '@/models/Task.js';
import { Transaction } from '@/models/Transaction.js';
import { Op } from 'sequelize';
import { requireSuperAdmin, logAdminActivity } from '@/middleware/auth';
import { AuthUtils } from '@/utils/auth';

const router = Router();

// Use integrated auth middleware
const authMiddleware = authenticateAdminIntegrated;

// Apply the appropriate middleware to all routes
router.use(authMiddleware);

/**
 * GET /api/settings/system-info
 * Get system information and statistics
 */
router.get('/system-info', asyncHandler(async (req: IntegratedAuthenticatedRequest, res) => {
    try {
        // Get counts for various entities
        const [
            adminCount,
            userCount,
            orderCount,
            taskCount,
            transactionCount
        ] = await Promise.all([
            Admin.count(),
            User.count(),
            Order.count(),
            Task.count(),
            Transaction.count()
        ]);

        // Get recent activities
        // Note: We'll implement this properly once we have the AdminActivity model fully set up

        res.json({
            message: 'System information retrieved successfully',
            data: {
                statistics: {
                    admins: adminCount,
                    users: userCount,
                    orders: orderCount,
                    tasks: taskCount,
                    transactions: transactionCount
                },
                system: {
                    version: process.env.npm_package_version || '1.0.0',
                    nodeVersion: process.version,
                    platform: process.platform,
                    arch: process.arch,
                    uptime: process.uptime()
                }
            }
        });
    } catch (error) {
        console.error('Error fetching system info:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to fetch system information'
        });
    }
}));

/**
 * GET /api/settings/admin-users
 * Get all admin users (super admin only)
 */
router.get('/admin-users', requireSuperAdmin, asyncHandler(async (req: IntegratedAuthenticatedRequest, res) => {
    try {
        const admins = await Admin.findAll({
            attributes: ['id', 'email', 'username', 'firstName', 'lastName', 'role', 'isActive', 'lastLogin', 'createdAt']
        });

        res.json({
            message: 'Admin users retrieved successfully',
            data: { admins }
        });
    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to fetch admin users'
        });
    }
}));

/**
 * POST /api/settings/admin-users
 * Create a new admin user (super admin only)
 */
router.post('/admin-users', requireSuperAdmin, logAdminActivity('CREATE', 'admin_user'), [
    body('email').isEmail().normalizeEmail(),
    body('username').isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
    body('firstName').isLength({ min: 1, max: 50 }).trim(),
    body('lastName').isLength({ min: 1, max: 50 }).trim(),
    body('password').isLength({ min: 8 }),
    body('role').optional().isIn(['ADMIN', 'SUPER_ADMIN'])
], asyncHandler(async (req: IntegratedAuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid input data',
            details: errors.array()
        });
    }

    const {
        email, username, firstName, lastName, password, role
    } = req.body;

    try {
        // Check if email or username already exists
        const existingAdmin = await Admin.findOne({
            where: {
                [Op.or]: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingAdmin) {
            return res.status(409).json({
                error: 'Conflict',
                message: existingAdmin.email === email ? 'Email already exists' : 'Username already exists'
            });
        }

        // Hash password
        const hashedPassword = await AuthUtils.hashPassword(password);

        // Create admin user
        const admin = await Admin.create({
            email,
            username,
            firstName,
            lastName,
            password: hashedPassword,
            role: role || 'ADMIN',
            isActive: true
        });

        res.status(201).json({
            message: 'Admin user created successfully',
            data: {
                admin: {
                    id: admin.id,
                    email: admin.email,
                    username: admin.username,
                    firstName: admin.firstName,
                    lastName: admin.lastName,
                    role: admin.role,
                    isActive: admin.isActive,
                    lastLogin: admin.lastLogin,
                    createdAt: admin.createdAt
                }
            }
        });
    } catch (error) {
        console.error('Error creating admin user:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to create admin user'
        });
    }
}));

/**
 * PUT /api/settings/admin-users/:id
 * Update an admin user (super admin only)
 */
router.put('/admin-users/:id', requireSuperAdmin, logAdminActivity('UPDATE', 'admin_user'), [
    body('firstName').optional().isLength({ min: 1, max: 50 }).trim(),
    body('lastName').optional().isLength({ min: 1, max: 50 }).trim(),
    body('username').optional().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
    body('role').optional().isIn(['ADMIN', 'SUPER_ADMIN']),
    body('isActive').optional().isBoolean()
], asyncHandler(async (req: IntegratedAuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid input data',
            details: errors.array()
        });
    }

    const { id } = req.params;
    const updateData = req.body;

    try {
        const admin = await Admin.findByPk(id);
        if (!admin) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Admin user not found'
            });
        }

        // Update admin user
        await admin.update(updateData);

        res.json({
            message: 'Admin user updated successfully',
            data: {
                admin: {
                    id: admin.id,
                    email: admin.email,
                    username: admin.username,
                    firstName: admin.firstName,
                    lastName: admin.lastName,
                    role: admin.role,
                    isActive: admin.isActive,
                    lastLogin: admin.lastLogin,
                    createdAt: admin.createdAt
                }
            }
        });
    } catch (error) {
        console.error('Error updating admin user:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to update admin user'
        });
    }
}));

/**
 * DELETE /api/settings/admin-users/:id
 * Delete an admin user (super admin only)
 */
router.delete('/admin-users/:id', requireSuperAdmin, logAdminActivity('DELETE', 'admin_user'), asyncHandler(async (req: IntegratedAuthenticatedRequest, res) => {
    const { id } = req.params;

    try {
        const admin = await Admin.findByPk(id);
        if (!admin) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Admin user not found'
            });
        }

        // Prevent deleting the last super admin
        const superAdminCount = await Admin.count({
            where: { role: 'SUPER_ADMIN' }
        });

        if (admin.role === 'SUPER_ADMIN' && superAdminCount <= 1) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Cannot delete the last super admin user'
            });
        }

        // Delete admin user
        await admin.destroy();

        res.json({
            message: 'Admin user deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting admin user:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to delete admin user'
        });
    }
}));

export { router as adminSettingsRoutes };
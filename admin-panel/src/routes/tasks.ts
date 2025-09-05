import { Router, Response } from 'express';
import { authenticateAdminIntegrated, AuthenticatedRequest as IntegratedAuthenticatedRequest } from '@/middleware/auth-integrated';
import { asyncHandler } from '@/middleware/errorHandler';
import { body, query, validationResult } from 'express-validator';
import db from '@/models/index.js';
import { Op } from 'sequelize';
import { requireAdminOrAbove, logAdminActivity } from '@/middleware/auth';

const { Task, User, Order } = db;

// Use the appropriate AuthenticatedRequest type based on auth mode
type AuthRequest = IntegratedAuthenticatedRequest;

// Use integrated auth middleware
const authMiddleware = authenticateAdminIntegrated;

const router = Router();

/**
 * GET /api/admin/tasks/pending
 * Get paginated list of pending tasks for approval
 */
router.get('/pending', authMiddleware, [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('platform').optional().isIn(['YOUTUBE', 'INSTAGRAM', 'TIKTOK', 'TWITTER', 'FACEBOOK']),
], asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid query parameters',
            details: errors.array()
        });
        return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const platform = req.query.platform as string;

    const offset = (page - 1) * limit;

    try {
        // Build where clause
        const where: any = { status: 'submitted' };

        if (search) {
            where[Op.or] = [
                { targetUrl: { [Op.like]: `%${search}%` } },
                { '$User.firstName$': { [Op.like]: `%${search}%` } },
                { '$User.lastName$': { [Op.like]: `%${search}%` } },
                { '$User.email$': { [Op.like]: `%${search}%` } }
            ];
        }

        if (platform) {
            where.platform = platform;
        }

        // Get tasks with pagination
        const { rows: tasks, count: total } = await Task.findAndCountAll({
            where,
            include: [{
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'email', 'username']
            }],
            order: [['updatedAt', 'DESC']],
            limit,
            offset
        });

        const totalPages = Math.ceil(total / limit);

        // Transform the data to match the frontend Task interface
        const transformedTasks = tasks.map((task: any) => ({
            id: task.id,
            userId: task.userId,
            title: `Task #${task.id.substring(0, 8)}`,
            description: task.description || '',
            serviceType: task.serviceType,
            platform: task.platform,
            targetUrl: task.targetUrl,
            quantity: task.quantity,
            startCount: task.startCount || 0,
            remainingCount: task.remainingCount || 0,
            status: task.status,
            adminStatus: task.status.toLowerCase(),
            reward: parseFloat(task.reward?.toString() || '0'),
            budgetTotal: parseFloat(task.reward?.toString() || '0') * task.quantity,
            unitPayoutMinor: parseFloat(task.reward?.toString() || '0') * 100,
            adminNotes: task.adminNotes || '',
            submittedAt: task.submittedAt || task.updatedAt,
            approvedAt: task.approvedAt,
            rejectedAt: task.rejectedAt,
            rejectionReason: task.rejectionReason || '',
            adminReviewedBy: task.adminReviewedBy || '',
            adminReviewedAt: task.approvedAt || task.rejectedAt,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            user: {
                id: task.User.id,
                firstName: task.User.firstName,
                lastName: task.User.lastName,
                email: task.User.email,
                username: task.User.username
            }
        }));

        res.json({
            message: 'Pending tasks retrieved successfully',
            data: {
                tasks: transformedTasks,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Error fetching pending tasks:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to fetch pending tasks'
        });
        return;
    }
}));

/**
 * GET /api/tasks
 * Get paginated list of tasks with filtering and sorting
 */
router.get('/', authMiddleware, [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('status').optional().isIn(['pending', 'processing', 'completed', 'failed']),
    query('platform').optional().isIn(['instagram', 'youtube']),
    query('type').optional().isString(),
    query('sortBy').optional().isIn(['createdAt', 'reward', 'updatedAt']),
    query('sortOrder').optional().isIn(['asc', 'desc'])
], asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid query parameters',
            details: errors.array()
        });
        return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const platform = req.query.platform as string;
    const type = req.query.type as string;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';

    const offset = (page - 1) * limit;

    try {
        // Build where clause
        const where: any = {};

        if (search) {
            where[Op.or] = [
                { targetUrl: { [Op.like]: `%${search}%` } },
                { '$User.firstName$': { [Op.like]: `%${search}%` } },
                { '$User.lastName$': { [Op.like]: `%${search}%` } },
                { '$User.email$': { [Op.like]: `%${search}%` } }
            ];
        }

        if (status) {
            where.status = status;
        }

        if (platform) {
            where.platform = platform;
        }

        if (type) {
            where.serviceType = type;
        }

        // Get tasks with pagination
        const { rows: tasks, count: total } = await Task.findAndCountAll({
            where,
            include: [{
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'email', 'username']
            }],
            order: [[sortBy, sortOrder.toUpperCase()]],
            limit,
            offset
        });

        const totalPages = Math.ceil(total / limit);

        res.json({
            message: 'Tasks retrieved successfully',
            data: {
                tasks,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to fetch tasks'
        });
        return;
    }
}));

/**
 * GET /api/tasks/:id
 * Get detailed task information
 */
router.get('/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const task = await Task.findByPk(id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName', 'email', 'username', 'balance']
                },
                {
                    model: Order,
                    attributes: ['id', 'platform', 'serviceType', 'targetUrl', 'quantity', 'status']
                }
            ]
        });

        if (!task) {
            res.status(404).json({
                error: 'Not Found',
                message: 'Task not found'
            });
            return;
        }

        res.json({
            message: 'Task details retrieved successfully',
            data: { task }
        });
    } catch (error) {
        console.error('Error fetching task details:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to fetch task details'
        });
        return;
    }
}));

/**
 * PUT /api/tasks/:id/approve
 * Approve a task
 */
router.put('/:id/approve', requireAdminOrAbove, logAdminActivity('APPROVE', 'task'), [
    body('adminNotes').optional().isString().trim()
], asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid input data',
            details: errors.array()
        });
        return;
    }

    const { id } = req.params;
    const { adminNotes } = req.body;

    try {
        const task = await Task.findByPk(id);
        if (!task) {
            res.status(404).json({
                error: 'Not Found',
                message: 'Task not found'
            });
            return;
        }

        // Check if task is already processed
        if (task.status !== 'submitted') {
            res.status(400).json({
                error: 'Bad Request',
                message: 'Task already processed'
            });
            return;
        }

        // Update task status
        await task.update({
            status: 'approved',
            adminNotes: adminNotes || task.adminNotes,
            approvedAt: new Date(),
            adminReviewedBy: req.admin?.id,
            adminReviewedAt: new Date()
        });

        res.json({
            message: 'Task approved successfully',
            data: { task }
        });
    } catch (error) {
        console.error('Error approving task:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to approve task'
        });
        return;
    }
}));

/**
 * PUT /api/tasks/:id/reject
 * Reject a task
 */
router.put('/:id/reject', requireAdminOrAbove, logAdminActivity('REJECT', 'task'), [
    body('rejectionReason').isString().trim().isLength({ min: 5 }),
    body('adminNotes').optional().isString().trim()
], asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid input data',
            details: errors.array()
        });
        return;
    }

    const { id } = req.params;
    const { rejectionReason, adminNotes } = req.body;

    try {
        const task = await Task.findByPk(id);
        if (!task) {
            res.status(404).json({
                error: 'Not Found',
                message: 'Task not found'
            });
            return;
        }

        // Check if task is already processed
        if (task.status !== 'submitted') {
            res.status(400).json({
                error: 'Bad Request',
                message: 'Task already processed'
            });
            return;
        }

        // Update task status
        await task.update({
            status: 'rejected',
            rejectionReason,
            adminNotes: adminNotes || task.adminNotes,
            rejectedAt: new Date(),
            adminReviewedBy: req.admin?.id,
            adminReviewedAt: new Date()
        });

        res.json({
            message: 'Task rejected successfully',
            data: { task }
        });
    } catch (error) {
        console.error('Error rejecting task:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to reject task'
        });
        return;
    }
}));

export { router as adminTaskRoutes };
import { Router, Response } from 'express';
import { authenticateAdminIntegrated, AuthenticatedRequest as IntegratedAuthenticatedRequest } from '@/middleware/auth-integrated';
import { asyncHandler } from '@/middleware/errorHandler';
import { body, query, validationResult } from 'express-validator';
import db from '@/models/index.js';
import { Op } from 'sequelize';
import { requireAdminOrAbove, logAdminActivity } from '@/middleware/auth';

const { Order, User } = db;

// Use the appropriate AuthenticatedRequest type based on auth mode
type AuthenticatedRequest = IntegratedAuthenticatedRequest;

const router = Router();

// Use integrated auth middleware
const authMiddleware = authenticateAdminIntegrated;

// Apply the appropriate middleware to all routes
router.use(authMiddleware);

/**
 * GET /api/admin/orders
 * Get paginated list of orders with filtering and sorting
 */
router.get('/', [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']),
    query('platform').optional().isIn(['YOUTUBE', 'INSTAGRAM', 'TIKTOK', 'TWITTER', 'FACEBOOK']),
    query('serviceType').optional().isIn(['LIKES', 'FOLLOWERS', 'SUBSCRIBERS', 'VIEWS', 'COMMENTS', 'SHARES']),
    query('sortBy').optional().isIn(['createdAt', 'amount', 'quantity', 'startCount']),
    query('sortOrder').optional().isIn(['asc', 'desc'])
], asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
    const serviceType = req.query.serviceType as string;
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

        if (serviceType) {
            where.serviceType = serviceType;
        }

        // Get orders with pagination
        const { rows: orders, count: total } = await Order.findAndCountAll({
            where,
            include: [{
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'email', 'userMode']
            }],
            order: [[sortBy, sortOrder.toUpperCase()]],
            limit,
            offset
        });

        const totalPages = Math.ceil(total / limit);

        // Transform the data to match the expected format
        const transformedOrders = orders.map((order: any) => ({
            id: order.id,
            userId: order.userId,
            platform: order.platform,
            service: order.serviceType,
            targetUrl: order.targetUrl,
            quantity: order.quantity,
            startCount: order.startCount,
            remainingCount: order.remainingCount,
            status: order.status,
            speed: order.speed,
            amount: parseFloat(order.amount),
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            user: {
                id: order.User.id,
                firstName: order.User.firstName,
                lastName: order.User.lastName,
                email: order.User.email,
                username: `${order.User.firstName}${order.User.lastName}`.toLowerCase(),
                userMode: order.User.userMode
            }
        }));

        res.json({
            message: 'Orders retrieved successfully',
            data: {
                orders: transformedOrders,
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
    } catch (error: any) {
        console.error('Database error:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to fetch orders'
        });
        return;
    }
}));

/**
 * GET /api/admin/orders/pending-approval
 * Get paginated list of pending orders for approval
 */
router.get('/pending-approval', [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
], asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
    const offset = (page - 1) * limit;

    try {
        // Build where clause for pending orders
        const where = { status: 'pending' };

        // Get orders with pagination
        const { rows: orders, count: total } = await Order.findAndCountAll({
            where,
            include: [{
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'email']
            }],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const totalPages = Math.ceil(total / limit);

        res.json({
            message: 'Pending orders retrieved successfully',
            data: {
                orders,
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
        console.error('Error fetching pending orders:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to fetch pending orders'
        });
        return;
    }
}));

/**
 * GET /api/admin/orders/:id
 * Get detailed order information
 */
router.get('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const order = await Order.findByPk(id, {
            include: [{
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'balance']
            }]
        });

        if (!order) {
            res.status(404).json({
                error: 'Not Found',
                message: 'Order not found'
            });
            return;
        }

        res.json({
            message: 'Order details retrieved successfully',
            data: { order }
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to fetch order details'
        });
        return;
    }
}));

/**
 * PUT /api/admin/orders/:id/approve
 * Approve an order
 */
router.put('/:id/approve', requireAdminOrAbove, logAdminActivity('APPROVE', 'order'), [
    body('adminNotes').optional().isString().trim()
], asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
    const adminId = req.admin?.id;

    try {
        const order = await Order.findByPk(id);
        if (!order) {
            res.status(404).json({
                error: 'Not Found',
                message: 'Order not found'
            });
            return;
        }

        // Check if order is already processed
        if (order.status !== 'pending') {
            res.status(400).json({
                error: 'Bad Request',
                message: 'Order already processed'
            });
            return;
        }

        // Update order status
        await order.update({
            status: 'processing',
            adminNotes: adminNotes || order.adminNotes,
            approvedBy: adminId,
            approvedAt: new Date()
        });

        res.json({
            message: 'Order approved successfully',
            data: { order }
        });
    } catch (error) {
        console.error('Error approving order:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to approve order'
        });
        return;
    }
}));

/**
 * PUT /api/admin/orders/:id/reject
 * Reject an order
 */
router.put('/:id/reject', requireAdminOrAbove, logAdminActivity('REJECT', 'order'), [
    body('rejectionReason').isString().trim().isLength({ min: 5 }),
    body('adminNotes').optional().isString().trim()
], asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
    const adminId = req.admin?.id;

    try {
        const order = await Order.findByPk(id);
        if (!order) {
            res.status(404).json({
                error: 'Not Found',
                message: 'Order not found'
            });
            return;
        }

        // Check if order is already processed
        if (order.status !== 'pending') {
            res.status(400).json({
                error: 'Bad Request',
                message: 'Order already processed'
            });
            return;
        }

        // Update order status
        await order.update({
            status: 'cancelled',
            rejectionReason,
            adminNotes: adminNotes || order.adminNotes,
            rejectedBy: adminId,
            rejectedAt: new Date()
        });

        res.json({
            message: 'Order rejected successfully',
            data: { order }
        });
    } catch (error) {
        console.error('Error rejecting order:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to reject order'
        });
        return;
    }
}));

/**
 * PUT /api/admin/orders/:id/refund
 * Refund an order
 */
router.put('/:id/refund', requireAdminOrAbove, logAdminActivity('REFUND', 'order'), [
    body('refundReason').isString().trim().isLength({ min: 5 }),
    body('adminNotes').optional().isString().trim()
], asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
    const { refundReason, adminNotes } = req.body;
    const adminId = req.admin?.id;

    try {
        const order = await Order.findByPk(id);
        if (!order) {
            res.status(404).json({
                error: 'Not Found',
                message: 'Order not found'
            });
            return;
        }

        // Check if order can be refunded
        if (order.status !== 'completed' && order.status !== 'processing') {
            res.status(400).json({
                error: 'Bad Request',
                message: 'Order cannot be refunded'
            });
            return;
        }

        // Update order status
        await order.update({
            status: 'refunded',
            refundReason,
            adminNotes: adminNotes || order.adminNotes,
            updatedBy: adminId,
            updatedAt: new Date()
        });

        res.json({
            message: 'Order refunded successfully',
            data: { order }
        });
    } catch (error) {
        console.error('Error refunding order:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to refund order'
        });
        return;
    }
}));

export { router as adminOrderRoutes };
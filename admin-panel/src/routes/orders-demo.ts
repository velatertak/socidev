import { Router } from 'express';
import { authenticateAdmin, AuthenticatedRequest, requireAdminOrAbove, logAdminActivity } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { body, validationResult } from 'express-validator';
import { Response } from 'express';

const router = Router();

// Demo data for orders
const mockOrders = [
    {
        id: 'ord_1',
        userId: 'user_1',
        platform: 'YOUTUBE',
        serviceType: 'SUBSCRIBERS',
        targetUrl: 'https://youtube.com/@johnsmith',
        quantity: 1000,
        pricePerUnit: 0.05,
        totalPrice: 50.0,
        status: 'PENDING',
        completedCount: 0,
        description: 'YouTube subscriber boost for tech channel',
        createdAt: new Date('2024-01-20T10:30:00Z').toISOString(),
        updatedAt: new Date('2024-01-20T10:30:00Z').toISOString(),
        user: {
            id: 'user_1',
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@example.com',
            userMode: 'TASK_GIVER',
            balance: 150.0
        }
    },
    {
        id: 'ord_2',
        userId: 'user_2',
        platform: 'INSTAGRAM',
        serviceType: 'LIKES',
        targetUrl: 'https://instagram.com/p/abc123/',
        quantity: 500,
        pricePerUnit: 0.02,
        totalPrice: 10.0,
        status: 'PENDING',
        completedCount: 0,
        description: 'Instagram likes for product launch post',
        createdAt: new Date('2024-01-19T14:20:00Z').toISOString(),
        updatedAt: new Date('2024-01-19T14:20:00Z').toISOString(),
        user: {
            id: 'user_2',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.johnson@example.com',
            userMode: 'TASK_GIVER',
            balance: 75.0
        }
    },
    {
        id: 'ord_3',
        userId: 'user_3',
        platform: 'TIKTOK',
        serviceType: 'VIEWS',
        targetUrl: 'https://tiktok.com/@creator/video/12345',
        quantity: 2000,
        pricePerUnit: 0.001,
        totalPrice: 2.0,
        status: 'IN_PROGRESS',
        completedCount: 1200,
        startTime: new Date('2024-01-18T09:00:00Z').toISOString(),
        description: 'TikTok views for viral challenge video',
        createdAt: new Date('2024-01-18T08:30:00Z').toISOString(),
        updatedAt: new Date('2024-01-18T12:00:00Z').toISOString(),
        user: {
            id: 'user_3',
            firstName: 'Mike',
            lastName: 'Chen',
            email: 'mike.chen@example.com',
            userMode: 'TASK_GIVER',
            balance: 25.0
        }
    },
    {
        id: 'ord_4',
        userId: 'user_4',
        platform: 'TWITTER',
        serviceType: 'FOLLOWERS',
        targetUrl: 'https://twitter.com/businessacct',
        quantity: 250,
        pricePerUnit: 0.08,
        totalPrice: 20.0,
        status: 'COMPLETED',
        completedCount: 250,
        startTime: new Date('2024-01-15T10:00:00Z').toISOString(),
        completionTime: new Date('2024-01-16T15:30:00Z').toISOString(),
        description: 'Twitter followers for business account',
        createdAt: new Date('2024-01-15T09:45:00Z').toISOString(),
        updatedAt: new Date('2024-01-16T15:30:00Z').toISOString(),
        user: {
            id: 'user_4',
            firstName: 'Emma',
            lastName: 'Wilson',
            email: 'emma.wilson@business.com',
            userMode: 'TASK_GIVER',
            balance: 200.0
        }
    },
    {
        id: 'ord_5',
        userId: 'user_1',
        platform: 'FACEBOOK',
        serviceType: 'LIKES',
        targetUrl: 'https://facebook.com/page/post/67890',
        quantity: 300,
        pricePerUnit: 0.03,
        totalPrice: 9.0,
        status: 'CANCELLED',
        completedCount: 0,
        description: 'Facebook page post likes - cancelled by user',
        createdAt: new Date('2024-01-14T16:20:00Z').toISOString(),
        updatedAt: new Date('2024-01-14T18:00:00Z').toISOString(),
        user: {
            id: 'user_1',
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@example.com',
            userMode: 'TASK_GIVER',
            balance: 150.0
        }
    }
];

/**
 * GET /api/orders
 * Get paginated list of orders with filtering and sorting
 */
router.get('/', authenticateAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const platform = req.query.platform as string;
    const serviceType = req.query.serviceType as string;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';

    // Filter orders
    let filteredOrders = [...mockOrders];

    if (search) {
        const searchLower = search.toLowerCase();
        filteredOrders = filteredOrders.filter(order =>
            order.id.toLowerCase().includes(searchLower) ||
            order.user.firstName.toLowerCase().includes(searchLower) ||
            order.user.lastName.toLowerCase().includes(searchLower) ||
            order.user.email.toLowerCase().includes(searchLower) ||
            order.targetUrl.toLowerCase().includes(searchLower)
        );
    }

    if (status) {
        filteredOrders = filteredOrders.filter(order => order.status === status);
    }

    if (platform) {
        filteredOrders = filteredOrders.filter(order => order.platform === platform);
    }

    if (serviceType) {
        filteredOrders = filteredOrders.filter(order => order.serviceType === serviceType);
    }

    // Sort orders
    filteredOrders.sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
            case 'totalPrice':
                aValue = a.totalPrice;
                bValue = b.totalPrice;
                break;
            case 'quantity':
                aValue = a.quantity;
                bValue = b.quantity;
                break;
            case 'completedCount':
                aValue = a.completedCount;
                bValue = b.completedCount;
                break;
            default:
                aValue = new Date(a.createdAt).getTime();
                bValue = new Date(b.createdAt).getTime();
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Paginate
    const total = filteredOrders.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const orders = filteredOrders.slice(skip, skip + limit);

    res.json({
        message: 'Orders retrieved successfully',
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
}));

/**
 * GET /api/orders/:id
 * Get detailed order information
 */
router.get('/:id', authenticateAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const order = mockOrders.find(o => o.id === id);

    if (!order) {
        return res.status(404).json({
            error: 'Not Found',
            message: 'Order not found'
        });
    }

    res.json({
        message: 'Order details retrieved successfully',
        data: { order }
    });
}));

/**
 * PUT /api/orders/:id/approve
 * Approve a pending order (admin only)
 */
router.put('/:id/approve', authenticateAdmin, requireAdminOrAbove, logAdminActivity('APPROVE', 'order'), [
    body('notes').optional().isLength({ max: 500 })
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { notes } = req.body;
    const orderIndex = mockOrders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
        return res.status(404).json({
            error: 'Not Found',
            message: 'Order not found'
        });
    }

    const order = mockOrders[orderIndex];
    if (order.status !== 'PENDING') {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Only pending orders can be approved'
        });
    }

    // Update order status
    mockOrders[orderIndex] = {
        ...order,
        status: 'IN_PROGRESS',
        startTime: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    res.json({
        message: 'Order approved successfully',
        data: { order: mockOrders[orderIndex] }
    });
}));

/**
 * PUT /api/orders/:id/reject
 * Reject a pending order (admin only)
 */
router.put('/:id/reject', authenticateAdmin, requireAdminOrAbove, logAdminActivity('REJECT', 'order'), [
    body('reason').isLength({ min: 1, max: 500 }).withMessage('Rejection reason is required')
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;
    const orderIndex = mockOrders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
        return res.status(404).json({
            error: 'Not Found',
            message: 'Order not found'
        });
    }

    const order = mockOrders[orderIndex];
    if (order.status !== 'PENDING') {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Only pending orders can be rejected'
        });
    }

    // Update order status
    mockOrders[orderIndex] = {
        ...order,
        status: 'CANCELLED',
        updatedAt: new Date().toISOString()
    };

    res.json({
        message: 'Order rejected successfully',
        data: {
            refundAmount: order.totalPrice,
            reason
        }
    });
}));

/**
 * PUT /api/orders/:id/status
 * Update order status (admin only)
 */
router.put('/:id/status', authenticateAdmin, requireAdminOrAbove, logAdminActivity('STATUS_UPDATE', 'order'), [
    body('status').isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REFUNDED']),
    body('reason').optional().isLength({ min: 1, max: 500 })
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { status, reason } = req.body;
    const orderIndex = mockOrders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
        return res.status(404).json({
            error: 'Not Found',
            message: 'Order not found'
        });
    }

    const order = mockOrders[orderIndex];
    const updateData: any = { status, updatedAt: new Date().toISOString() };

    if (status === 'COMPLETED') {
        updateData.completionTime = new Date().toISOString();
        updateData.completedCount = order.quantity;
    } else if (status === 'IN_PROGRESS' && !order.startTime) {
        updateData.startTime = new Date().toISOString();
    }

    mockOrders[orderIndex] = { ...order, ...updateData };

    res.json({
        message: 'Order status updated successfully',
        data: { order: mockOrders[orderIndex] }
    });
}));

/**
 * GET /api/orders/pending-approval
 * Get orders waiting for admin approval
 */
router.get('/pending-approval', authenticateAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const pendingOrders = mockOrders.filter(o => o.status === 'PENDING');
    const total = pendingOrders.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const orders = pendingOrders.slice(skip, skip + limit);

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
}));

/**
 * POST /api/orders/bulk-actions
 * Perform bulk actions on selected orders
 */
router.post('/bulk-actions', authenticateAdmin, requireAdminOrAbove, logAdminActivity('BULK_ACTION', 'orders'), [
    body('orderIds').isArray({ min: 1 }).withMessage('At least one order ID is required'),
    body('action').isIn(['approve', 'reject', 'cancel']).withMessage('Invalid action'),
    body('reason').optional().isLength({ max: 500 })
], asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { orderIds, action, reason } = req.body;
    const results = [];

    for (const orderId of orderIds) {
        const orderIndex = mockOrders.findIndex(o => o.id === orderId);

        if (orderIndex === -1) {
            results.push({ orderId, status: 'error', error: 'Order not found' });
            continue;
        }

        const order = mockOrders[orderIndex];

        if (action === 'approve' || action === 'reject') {
            if (order.status !== 'PENDING') {
                results.push({ orderId, status: 'error', error: 'Order is not pending' });
                continue;
            }
        }

        try {
            if (action === 'approve') {
                mockOrders[orderIndex] = {
                    ...order,
                    status: 'IN_PROGRESS',
                    startTime: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                results.push({ orderId, status: 'approved' });
            } else if (action === 'reject') {
                mockOrders[orderIndex] = {
                    ...order,
                    status: 'CANCELLED',
                    updatedAt: new Date().toISOString()
                };
                results.push({ orderId, status: 'rejected' });
            }
        } catch (error: any) {
            results.push({ orderId, status: 'error', error: error.message });
        }
    }

    res.json({
        message: `Bulk ${action} completed`,
        data: { results }
    });
}));

/**
 * GET /api/orders/statistics/overview
 * Get order statistics for dashboard
 */
router.get('/statistics/overview', authenticateAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const ordersByStatus = mockOrders.reduce((acc, order) => {
        if (!acc[order.status]) {
            acc[order.status] = { count: 0, revenue: 0 };
        }
        acc[order.status].count++;
        if (order.status === 'COMPLETED') {
            acc[order.status].revenue += order.totalPrice;
        }
        return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayOrders = mockOrders.filter(o => new Date(o.createdAt) >= startOfToday).length;
    const yesterdayOrders = mockOrders.filter(o =>
        new Date(o.createdAt) >= startOfYesterday && new Date(o.createdAt) < startOfToday
    ).length;
    const weekOrders = mockOrders.filter(o => new Date(o.createdAt) >= startOfWeek).length;
    const monthOrders = mockOrders.filter(o => new Date(o.createdAt) >= startOfMonth).length;

    const totalRevenue = mockOrders
        .filter(o => o.status === 'COMPLETED')
        .reduce((sum, o) => sum + o.totalPrice, 0);

    const todayRevenue = mockOrders
        .filter(o => o.status === 'COMPLETED' && new Date(o.createdAt) >= startOfToday)
        .reduce((sum, o) => sum + o.totalPrice, 0);

    const monthRevenue = mockOrders
        .filter(o => o.status === 'COMPLETED' && new Date(o.createdAt) >= startOfMonth)
        .reduce((sum, o) => sum + o.totalPrice, 0);

    const platformDistribution = mockOrders.reduce((acc, order) => {
        if (!acc[order.platform]) {
            acc[order.platform] = { count: 0, revenue: 0 };
        }
        acc[order.platform].count++;
        if (order.status === 'COMPLETED') {
            acc[order.platform].revenue += order.totalPrice;
        }
        return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    const serviceTypeDistribution = mockOrders.reduce((acc, order) => {
        if (!acc[order.serviceType]) {
            acc[order.serviceType] = { count: 0, revenue: 0 };
        }
        acc[order.serviceType].count++;
        if (order.status === 'COMPLETED') {
            acc[order.serviceType].revenue += order.totalPrice;
        }
        return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    res.json({
        message: 'Order statistics retrieved successfully',
        data: {
            ordersByStatus,
            orderCounts: {
                today: todayOrders,
                yesterday: yesterdayOrders,
                week: weekOrders,
                month: monthOrders
            },
            revenue: {
                total: totalRevenue,
                today: todayRevenue,
                month: monthRevenue
            },
            platformDistribution,
            serviceTypeDistribution
        }
    });
}));

export { router as adminOrderRoutes };
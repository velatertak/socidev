import { Router, Response } from 'express';
import { authenticateAdminIntegrated, AuthenticatedRequest as IntegratedAuthenticatedRequest } from '@/middleware/auth-integrated';
import { asyncHandler } from '@/middleware/errorHandler';
import { query, validationResult } from 'express-validator';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { User } from '@/models/User.js';
import { Order } from '@/models/Order.js';
import { Task } from '@/models/Task.js';
import { Op, fn, col } from 'sequelize';

// Use the appropriate AuthenticatedRequest type based on auth mode
type AuthRequest = IntegratedAuthenticatedRequest;

// Use integrated auth middleware
const authMiddleware = authenticateAdminIntegrated;

const router = Router();

/**
 * GET /api/analytics/overview
 * Get comprehensive analytics overview
 */
router.get('/overview', authMiddleware, [
    query('period').optional().isIn(['7d', '30d', '3m', '6m', '1y']),
    query('platform').optional().isIn(['YOUTUBE', 'INSTAGRAM', 'TIKTOK', 'TWITTER', 'FACEBOOK'])
], asyncHandler(async (req: IntegratedAuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid query parameters',
            details: errors.array()
        });
    }

    const period = req.query.period as string || '30d';
    const platform = req.query.platform as string;

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (period) {
        case '7d':
            startDate = subDays(now, 7);
            break;
        case '3m':
            startDate = subMonths(now, 3);
            break;
        case '6m':
            startDate = subMonths(now, 6);
            break;
        case '1y':
            startDate = subMonths(now, 12);
            break;
        default: // 30d
            startDate = subDays(now, 30);
    }

    const whereClause: any = platform ? { platform } : {};
    const dateFilter = { createdAt: { [Op.between]: [startDate, now] } };

    try {
        // Get user metrics
        const totalUsers = await User.count();
        const activeUsers = await User.count({
            where: {
                ...whereClause,
                isActive: true,
                lastLoginAt: { [Op.gte]: subDays(now, 30) }
            }
        });
        const newUsers = await User.count({
            where: {
                ...whereClause,
                ...dateFilter
            }
        });

        // Get order metrics
        const orderWhereClause = {
            ...(platform ? { platform } : {}),
            ...dateFilter
        };

        const totalOrders = await Order.count({
            where: orderWhereClause
        });

        const completedOrders = await Order.count({
            where: {
                ...orderWhereClause,
                status: 'completed'
            }
        });

        const totalRevenueResult = await Order.findOne({
            attributes: [[fn('SUM', col('amount')), 'total']],
            where: {
                ...orderWhereClause,
                status: 'completed'
            }
        });
        const totalRevenue = totalRevenueResult?.get('total') || 0;

        // Get task metrics
        const taskWhereClause = {
            ...(platform ? { platform } : {}),
            ...dateFilter
        };

        const totalTasks = await Task.count({
            where: taskWhereClause
        });

        const completedTasks = await Task.count({
            where: {
                ...taskWhereClause,
                status: 'approved'
            }
        });

        const totalPayoutsResult = await Task.findOne({
            attributes: [[fn('SUM', col('reward')), 'total']],
            where: {
                ...taskWhereClause,
                status: 'approved'
            }
        });
        const totalPayouts = totalPayoutsResult?.get('total') || 0;

        // Calculate rates
        const orderCompletionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
        const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        const avgOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;
        const avgTaskReward = completedTasks > 0 ? totalPayouts / completedTasks : 0;

        res.json({
            message: 'Analytics overview retrieved successfully',
            data: {
                period,
                platform: platform || 'all',
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    new: newUsers,
                    activePercentage: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
                },
                orders: {
                    total: totalOrders,
                    completed: completedOrders,
                    completionRate: Math.round(orderCompletionRate * 100) / 100,
                    avgValue: Math.round(avgOrderValue * 100) / 100
                },
                tasks: {
                    total: totalTasks,
                    completed: completedTasks,
                    completionRate: Math.round(taskCompletionRate * 100) / 100,
                    avgReward: Math.round(avgTaskReward * 100) / 100
                },
                revenue: {
                    total: totalRevenue,
                    payouts: totalPayouts,
                    profit: totalRevenue - totalPayouts
                },
                socialAccounts: {
                    total: 0,
                    active: 0,
                    activePercentage: 0
                }
            }
        });
    } catch (error) {
        console.error('Error fetching analytics overview:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to fetch analytics overview'
        });
    }
}));

/**
 * GET /api/analytics/charts/revenue
 * Get revenue chart data over time
 */
router.get('/charts/revenue', authMiddleware, [
    query('period').optional().isIn(['7d', '30d', '3m', '6m', '1y']),
    query('groupBy').optional().isIn(['day', 'week', 'month'])
], asyncHandler(async (req: IntegratedAuthenticatedRequest, res: Response) => {
    const period = req.query.period as string || '30d';
    const groupBy = req.query.groupBy as string || 'day';

    const now = new Date();
    let startDate: Date;
    let dateFormat: string;

    switch (period) {
        case '7d':
            startDate = subDays(now, 7);
            dateFormat = 'yyyy-MM-dd';
            break;
        case '3m':
            startDate = subMonths(now, 3);
            dateFormat = 'yyyy-MM';
            break;
        case '6m':
            startDate = subMonths(now, 6);
            dateFormat = 'yyyy-MM';
            break;
        case '1y':
            startDate = subMonths(now, 12);
            dateFormat = 'yyyy-MM';
            break;
        default: // 30d
            startDate = subDays(now, 30);
            dateFormat = 'yyyy-MM-dd';
    }

    try {
        // Get revenue data grouped by date
        const revenueData = await Order.findAll({
            attributes: [
                [fn('DATE', col('createdAt')), 'date'],
                [fn('SUM', col('amount')), 'revenue'],
                [fn('COUNT', col('id')), 'orderCount']
            ],
            where: {
                status: 'completed',
                createdAt: {
                    [Op.between]: [startDate, now]
                }
            },
            group: [fn('DATE', col('createdAt'))],
            order: [[fn('DATE', col('createdAt')), 'ASC']]
        });

        // Format the data for the chart
        const formattedData = revenueData.map((item: any) => ({
            date: format(new Date(item.get('date')), dateFormat),
            revenue: parseFloat(item.get('revenue')) || 0,
            orderCount: parseInt(item.get('orderCount')) || 0
        }));

        res.json({
            message: 'Revenue chart data retrieved successfully',
            data: formattedData,
            period,
            groupBy
        });
    } catch (error) {
        console.error('Error fetching revenue chart data:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to fetch revenue chart data'
        });
    }
}));

/**
 * GET /api/analytics/charts/users
 * Get user registration chart data over time
 */
router.get('/charts/users', authMiddleware, [
    query('period').optional().isIn(['7d', '30d', '3m', '6m', '1y']),
    query('groupBy').optional().isIn(['day', 'week', 'month'])
], asyncHandler(async (req: IntegratedAuthenticatedRequest, res: Response) => {
    const period = req.query.period as string || '30d';
    const groupBy = req.query.groupBy as string || 'day';

    const now = new Date();
    let startDate: Date;
    let dateFormat: string;

    switch (period) {
        case '7d':
            startDate = subDays(now, 7);
            dateFormat = 'yyyy-MM-dd';
            break;
        case '3m':
            startDate = subMonths(now, 3);
            dateFormat = 'yyyy-MM';
            break;
        case '6m':
            startDate = subMonths(now, 6);
            dateFormat = 'yyyy-MM';
            break;
        case '1y':
            startDate = subMonths(now, 12);
            dateFormat = 'yyyy-MM';
            break;
        default: // 30d
            startDate = subDays(now, 30);
            dateFormat = 'yyyy-MM-dd';
    }

    try {
        // Get user registration data grouped by date
        const userData = await User.findAll({
            attributes: [
                [fn('DATE', col('createdAt')), 'date'],
                [fn('COUNT', col('id')), 'userCount']
            ],
            where: {
                createdAt: {
                    [Op.between]: [startDate, now]
                }
            },
            group: [fn('DATE', col('createdAt'))],
            order: [[fn('DATE', col('createdAt')), 'ASC']]
        });

        // Format the data for the chart
        const formattedData = userData.map((item: any) => ({
            date: format(new Date(item.get('date')), dateFormat),
            userCount: parseInt(item.get('userCount')) || 0
        }));

        res.json({
            message: 'User registration chart data retrieved successfully',
            data: formattedData,
            period,
            groupBy
        });
    } catch (error) {
        console.error('Error fetching user chart data:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to fetch user chart data'
        });
    }
}));

/**
 * GET /api/analytics/charts/tasks
 * Get task completion chart data over time
 */
router.get('/charts/tasks', authMiddleware, [
    query('period').optional().isIn(['7d', '30d', '3m', '6m', '1y']),
    query('groupBy').optional().isIn(['day', 'week', 'month'])
], asyncHandler(async (req: IntegratedAuthenticatedRequest, res: Response) => {
    const period = req.query.period as string || '30d';
    const groupBy = req.query.groupBy as string || 'day';

    const now = new Date();
    let startDate: Date;
    let dateFormat: string;

    switch (period) {
        case '7d':
            startDate = subDays(now, 7);
            dateFormat = 'yyyy-MM-dd';
            break;
        case '3m':
            startDate = subMonths(now, 3);
            dateFormat = 'yyyy-MM';
            break;
        case '6m':
            startDate = subMonths(now, 6);
            dateFormat = 'yyyy-MM';
            break;
        case '1y':
            startDate = subMonths(now, 12);
            dateFormat = 'yyyy-MM';
            break;
        default: // 30d
            startDate = subDays(now, 30);
            dateFormat = 'yyyy-MM-dd';
    }

    try {
        // Get task completion data grouped by date
        const taskData = await Task.findAll({
            attributes: [
                [fn('DATE', col('createdAt')), 'date'],
                [fn('COUNT', col('id')), 'taskCount'],
                [fn('SUM', col('reward')), 'totalPayout']
            ],
            where: {
                status: 'approved',
                createdAt: {
                    [Op.between]: [startDate, now]
                }
            },
            group: [fn('DATE', col('createdAt'))],
            order: [[fn('DATE', col('createdAt')), 'ASC']]
        });

        // Format the data for the chart
        const formattedData = taskData.map((item: any) => ({
            date: format(new Date(item.get('date')), dateFormat),
            taskCount: parseInt(item.get('taskCount')) || 0,
            totalPayout: parseFloat(item.get('totalPayout')) || 0
        }));

        res.json({
            message: 'Task completion chart data retrieved successfully',
            data: formattedData,
            period,
            groupBy
        });
    } catch (error) {
        console.error('Error fetching task chart data:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to fetch task chart data'
        });
    }
}));

/**
 * GET /api/analytics/platforms
 * Get platform-specific analytics
 */
router.get('/platforms', authMiddleware, asyncHandler(async (req: IntegratedAuthenticatedRequest, res: Response) => {
    try {
        // Get platform distribution for orders
        const orderPlatforms = await Order.findAll({
            attributes: [
                'platform',
                [fn('COUNT', col('id')), 'orderCount'],
                [fn('SUM', col('amount')), 'totalRevenue']
            ],
            where: {
                status: 'completed'
            },
            group: ['platform']
        });

        // Get platform distribution for tasks
        const taskPlatforms = await Task.findAll({
            attributes: [
                'platform',
                [fn('COUNT', col('id')), 'taskCount'],
                [fn('SUM', col('reward')), 'totalPayout']
            ],
            where: {
                status: 'approved'
            },
            group: ['platform']
        });

        // Format the data
        const formattedOrderData = orderPlatforms.map((item: any) => ({
            platform: item.platform,
            orderCount: parseInt(item.get('orderCount')) || 0,
            totalRevenue: parseFloat(item.get('totalRevenue')) || 0
        }));

        const formattedTaskData = taskPlatforms.map((item: any) => ({
            platform: item.platform,
            taskCount: parseInt(item.get('taskCount')) || 0,
            totalPayout: parseFloat(item.get('totalPayout')) || 0
        }));

        res.json({
            message: 'Platform analytics retrieved successfully',
            data: {
                orders: formattedOrderData,
                tasks: formattedTaskData
            }
        });
    } catch (error) {
        console.error('Error fetching platform analytics:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to fetch platform analytics'
        });
    }
}));

export { router as adminAnalyticsRoutes };
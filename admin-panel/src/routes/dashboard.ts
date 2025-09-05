import { Router } from 'express';
import { authenticateAdminIntegrated, AuthenticatedRequest as IntegratedAuthenticatedRequest } from '@/middleware/auth-integrated';
import { asyncHandler } from '@/middleware/errorHandler';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { User } from '@/models/User.js';
import { Order } from '@/models/Order.js';
import { Task } from '@/models/Task.js';
import { AdminActivity } from '@/models/AdminActivity.js';
import { Admin } from '@/models/Admin.js';
import sequelize from '@/config/database.js';
import { Op, fn, col } from 'sequelize';

// Use the appropriate AuthenticatedRequest type based on auth mode
type AuthenticatedRequest = IntegratedAuthenticatedRequest;

const router = Router();

// Use integrated auth middleware
const authMiddleware = authenticateAdminIntegrated;

// Apply the appropriate middleware to all routes
router.use(authMiddleware);

/**
 * GET /api/dashboard/overview
 * Get dashboard overview statistics
 */
router.get('/overview', asyncHandler(async (req: AuthenticatedRequest, res) => {
    const now = new Date();
    const today = startOfDay(now);
    const yesterday = startOfDay(subDays(now, 1));
    const thisMonth = startOfMonth(now);
    const lastMonth = startOfMonth(subMonths(now, 1));

    try {
        // Get user statistics
        const totalUsers = await User.count();
        const activeUsers = await User.count({ where: { isActive: true } });
        const usersToday = await User.count({
            where: {
                createdAt: {
                    [Op.between]: [today, endOfDay(now)]
                }
            }
        });
        const usersYesterday = await User.count({
            where: {
                createdAt: {
                    [Op.between]: [yesterday, endOfDay(subDays(now, 1))]
                }
            }
        });

        // Get order statistics
        const totalOrders = await Order.count();
        const pendingOrders = await Order.count({ where: { status: 'pending' } });
        const completedOrders = await Order.count({ where: { status: 'completed' } });
        const ordersToday = await Order.count({
            where: {
                createdAt: {
                    [Op.between]: [today, endOfDay(now)]
                }
            }
        });

        // Get revenue statistics
        const totalRevenueResult = await Order.findOne({
            attributes: [[fn('SUM', col('amount')), 'total']],
            where: { status: 'completed' }
        });
        const totalRevenue = totalRevenueResult?.get('total') || 0;

        const revenueTodayResult = await Order.findOne({
            attributes: [[fn('SUM', col('amount')), 'total']],
            where: {
                status: 'completed',
                createdAt: {
                    [Op.between]: [today, endOfDay(now)]
                }
            }
        });
        const revenueToday = revenueTodayResult?.get('total') || 0;

        const revenueThisMonthResult = await Order.findOne({
            attributes: [[fn('SUM', col('amount')), 'total']],
            where: {
                status: 'completed',
                createdAt: {
                    [Op.between]: [thisMonth, endOfMonth(now)]
                }
            }
        });
        const revenueThisMonth = revenueThisMonthResult?.get('total') || 0;

        const revenueLastMonthResult = await Order.findOne({
            attributes: [[fn('SUM', col('amount')), 'total']],
            where: {
                status: 'completed',
                createdAt: {
                    [Op.between]: [lastMonth, endOfMonth(subMonths(now, 1))]
                }
            }
        });
        const revenueLastMonth = revenueLastMonthResult?.get('total') || 0;

        // Get task statistics
        const totalTasks = await Task.count();
        const availableTasks = await Task.count({ where: { status: 'available' } });
        const completedTasks = await Task.count({ where: { status: 'approved' } });

        // Calculate growth rates
        const userGrowthRate = usersYesterday > 0 ?
            ((usersToday - usersYesterday) / usersYesterday * 100) : 0;

        const revenueGrowthRate = revenueLastMonth > 0 ?
            ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100) : 0;

        res.json({
            message: 'Dashboard overview retrieved successfully',
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    today: usersToday,
                    yesterday: usersYesterday,
                    growthRate: userGrowthRate
                },
                orders: {
                    total: totalOrders,
                    pending: pendingOrders,
                    completed: completedOrders,
                    today: ordersToday
                },
                revenue: {
                    total: totalRevenue,
                    today: revenueToday,
                    thisMonth: revenueThisMonth,
                    lastMonth: revenueLastMonth,
                    growthRate: revenueGrowthRate
                },
                tasks: {
                    total: totalTasks,
                    available: availableTasks,
                    completed: completedTasks
                },
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard overview:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to fetch dashboard overview'
        });
    }
}));

/**
 * GET /api/dashboard/recent-activities
 * Get recent activities across the system
 */
router.get('/recent-activities', asyncHandler(async (req: AuthenticatedRequest, res) => {
    const limit = parseInt(req.query.limit as string) || 50;

    try {
        // Get recent orders
        const recentOrders = await Order.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']],
            include: [{
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'email']
            }]
        });

        // Get recent users
        const recentUsers = await User.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt', 'isActive', 'userMode']
        });

        // Get recent tasks
        const recentTasks = await Task.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: Order,
                    attributes: ['id', 'platform', 'serviceType']
                }
            ]
        });

        // Get recent admin activities
        const recentAdminActivities = await AdminActivity.findAll({
            limit: 20,
            order: [['createdAt', 'DESC']],
            include: [{
                model: Admin,
                attributes: ['id', 'firstName', 'lastName', 'email']
            }]
        });

        res.json({
            message: 'Recent activities retrieved successfully',
            data: {
                recentOrders,
                recentUsers,
                recentTasks,
                recentAdminActivities
            }
        });
    } catch (error) {
        console.error('Error fetching recent activities:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to fetch recent activities'
        });
    }
}));

/**
 * GET /api/dashboard/analytics/chart-data
 * Get chart data for dashboard analytics
 */
router.get('/analytics/chart-data', asyncHandler(async (req: AuthenticatedRequest, res) => {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    try {
        // Get daily user registrations
        const dailyUsers = await User.findAll({
            attributes: [
                [fn('DATE', col('createdAt')), 'date'],
                [fn('COUNT', col('id')), 'count']
            ],
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                }
            },
            group: [fn('DATE', col('createdAt'))],
            order: [[fn('DATE', col('createdAt')), 'ASC']]
        });

        // Get daily orders
        const dailyOrders = await Order.findAll({
            attributes: [
                [fn('DATE', col('createdAt')), 'date'],
                [fn('COUNT', col('id')), 'count'],
                [fn('SUM', col('amount')), 'revenue']
            ],
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                }
            },
            group: [fn('DATE', col('createdAt'))],
            order: [[fn('DATE', col('createdAt')), 'ASC']]
        });

        // Get platform distribution
        const platformDistribution = await Order.findAll({
            attributes: [
                'platform',
                [fn('COUNT', col('id')), 'count'],
                [fn('SUM', col('amount')), 'revenue']
            ],
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                }
            },
            group: ['platform']
        });

        // Get service type distribution
        const serviceTypeDistribution = await Order.findAll({
            attributes: [
                'serviceType',
                [fn('COUNT', col('id')), 'count'],
                [fn('SUM', col('amount')), 'revenue']
            ],
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                }
            },
            group: ['serviceType']
        });

        res.json({
            message: 'Chart data retrieved successfully',
            data: {
                dailyUsers: dailyUsers.map((item: any) => ({
                    date: item.get('date'),
                    count: Number(item.get('count'))
                })),
                dailyOrders: dailyOrders.map((item: any) => ({
                    date: item.get('date'),
                    count: Number(item.get('count')),
                    revenue: item.get('revenue') || 0
                })),
                platformDistribution: platformDistribution.map((item: any) => ({
                    platform: item.platform,
                    count: Number(item.get('count')),
                    revenue: item.get('revenue') || 0
                })),
                serviceTypeDistribution: serviceTypeDistribution.map((item: any) => ({
                    serviceType: item.serviceType,
                    count: Number(item.get('count')),
                    revenue: item.get('revenue') || 0
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching chart data:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to fetch chart data'
        });
    }
}));

export { router as adminDashboardRoutes };
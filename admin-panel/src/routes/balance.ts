import { Router, Response } from 'express';
import { authenticateAdminIntegrated, AuthenticatedRequest as IntegratedAuthenticatedRequest } from '@/middleware/auth-integrated';
import { asyncHandler } from '@/middleware/errorHandler';
import { body, query, validationResult } from 'express-validator';
import db from '@/models/index.js';
import { Op, literal as sequelizeLiteral } from 'sequelize';
import { requireAdminOrAbove, logAdminActivity } from '@/middleware/auth';

const { Transaction, User } = db;

const router = Router();

// Apply the appropriate middleware to all routes
router.use(authenticateAdminIntegrated);

/**
 * GET /api/admin/balance/requests
 * Get paginated list of balance requests (deposits and withdrawals)
 */
router.get('/requests', [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('type').optional().isIn(['deposit', 'withdrawal']),
    query('status').optional().isIn(['pending', 'completed', 'failed']),
    query('search').optional().isString()
], asyncHandler(async (req: IntegratedAuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid input data',
            details: errors.array()
        });
        return;
    }

    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;
        const type = req.query.type as string;
        const status = req.query.status as string;
        const search = req.query.search as string;

        // Build where clause
        const where: any = {};
        if (type) where.type = type;
        if (status) where.status = status;

        // Add search condition if provided
        if (search) {
            where[Op.or] = [
                { '$User.email$': { [Op.like]: `%${search}%` } },
                { '$User.username$': { [Op.like]: `%${search}%` } },
                { '$User.first_name$': { [Op.like]: `%${search}%` } },
                { '$User.last_name$': { [Op.like]: `%${search}%` } }
            ];
        }

        // Get transactions with user info
        const { rows: transactions, count } = await Transaction.findAndCountAll({
            where,
            include: [{
                model: User,
                attributes: ['id', 'email', 'firstName', 'lastName', 'username', 'balance']
            }],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.json({
            message: 'Balance requests retrieved successfully',
            data: {
                transactions,
                pagination: {
                    page,
                    limit,
                    total: count,
                    totalPages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching balance requests:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to fetch balance requests'
        });
        return;
    }
}));

/**
 * PUT /api/admin/balance/requests/:id/approve
 * Approve a balance request
 */
router.put('/requests/:id/approve', requireAdminOrAbove, logAdminActivity('APPROVE', 'balance'), [
    body('adminNotes').optional().isString().trim()
], asyncHandler(async (req: IntegratedAuthenticatedRequest, res: Response): Promise<void> => {
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
        // Find the transaction
        const transaction = await Transaction.findByPk(id, {
            include: [User]
        });

        if (!transaction) {
            res.status(404).json({
                error: 'Not Found',
                message: 'Transaction not found'
            });
            return;
        }

        // Check if transaction is already processed
        if (transaction.status !== 'pending') {
            res.status(400).json({
                error: 'Bad Request',
                message: 'Transaction already processed'
            });
            return;
        }

        // Process based on transaction type
        if (transaction.type === 'deposit') {
            // For deposits, add the amount to user's balance
            await User.update(
                { balance: sequelizeLiteral(`balance + ${transaction.amount}`) },
                { where: { id: transaction.userId } }
            );
        } else if (transaction.type === 'withdrawal') {
            // For withdrawals, the amount was already deducted, just mark as completed
            // No additional action needed
        } else {
            res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid transaction type for approval'
            });
            return;
        }

        // Update transaction status
        await transaction.update({
            status: 'completed',
            adminNotes: adminNotes || transaction.adminNotes
        });

        res.json({
            message: 'Transaction approved successfully',
            data: { transaction }
        });
    } catch (error) {
        console.error('Error approving transaction:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to approve transaction'
        });
        return;
    }
}));

/**
 * PUT /api/admin/balance/requests/:id/reject
 * Reject a balance request
 */
router.put('/requests/:id/reject', requireAdminOrAbove, logAdminActivity('REJECT', 'balance'), [
    body('rejectionReason').isString().trim().isLength({ min: 5 }),
    body('adminNotes').optional().isString().trim()
], asyncHandler(async (req: IntegratedAuthenticatedRequest, res: Response): Promise<void> => {
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
        // Find the transaction
        const transaction = await Transaction.findByPk(id, {
            include: [User]
        });

        if (!transaction) {
            res.status(404).json({
                error: 'Not Found',
                message: 'Transaction not found'
            });
            return;
        }

        // Check if transaction is already processed
        if (transaction.status !== 'pending') {
            res.status(400).json({
                error: 'Bad Request',
                message: 'Transaction already processed'
            });
            return;
        }

        // Process based on transaction type
        if (transaction.type === 'deposit') {
            // For deposits, no balance was added yet, so no refund needed
        } else if (transaction.type === 'withdrawal') {
            // For withdrawals, refund the amount back to user's balance
            await User.update(
                { balance: sequelizeLiteral(`balance + ${Math.abs(transaction.amount)}`) },
                { where: { id: transaction.userId } }
            );
        } else {
            res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid transaction type for rejection'
            });
            return;
        }

        // Update transaction status
        await transaction.update({
            status: 'failed',
            rejectionReason,
            adminNotes: adminNotes || transaction.adminNotes
        });

        res.json({
            message: 'Transaction rejected successfully',
            data: { transaction }
        });
    } catch (error) {
        console.error('Error rejecting transaction:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to reject transaction'
        });
        return;
    }
}));

/**
 * GET /api/admin/balance/requests/:id
 * Get details of a specific balance request
 */
router.get('/requests/:id', asyncHandler(async (req: IntegratedAuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Find the transaction with user info
        const transaction = await Transaction.findByPk(id, {
            include: [{
                model: User,
                attributes: ['id', 'email', 'firstName', 'lastName', 'username', 'balance']
            }]
        });

        if (!transaction) {
            res.status(404).json({
                error: 'Not Found',
                message: 'Transaction not found'
            });
            return;
        }

        res.json({
            message: 'Transaction details retrieved successfully',
            data: { transaction }
        });
    } catch (error) {
        console.error('Error fetching transaction details:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to fetch transaction details'
        });
        return;
    }
}));

export { router as adminBalanceRoutes };
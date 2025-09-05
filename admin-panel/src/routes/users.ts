import { Router, Response } from 'express';
import { authenticateAdminIntegrated, AuthenticatedRequest as IntegratedAuthenticatedRequest } from '@/middleware/auth-integrated';
import { asyncHandler } from '@/middleware/errorHandler';
import { body, query, validationResult } from 'express-validator';
import { AuthUtils } from '@/utils/auth';
import db from '@/models/index.js';
import { Op, fn, col } from 'sequelize';
import { requireAdminOrAbove, logAdminActivity } from '@/middleware/auth';
import { UserAttributes } from '@/types/models';

const { User } = db;

// Use the appropriate AuthenticatedRequest type based on auth mode
type AuthenticatedRequest = IntegratedAuthenticatedRequest;

const router = Router();

// Use integrated auth middleware
const authMiddleware = authenticateAdminIntegrated;

// Apply the appropriate middleware to all routes
router.use(authMiddleware);

/**
 * GET /api/users/statistics
 * Get user statistics by type
 */
router.get('/statistics', asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        // Get user counts by type
        const userTypes = await User.findAll({
            attributes: ['userMode', [fn('COUNT', col('id')), 'count']],
            group: ['userMode']
        });

        // Transform the data to match frontend expectations
        let taskGivers = 0;
        let taskDoers = 0;

        userTypes.forEach((item: any) => {
            if (item.userMode === 'taskGiver') {
                taskGivers = Number(item.get('count'));
            } else if (item.userMode === 'taskDoer') {
                taskDoers = Number(item.get('count'));
            }
        });

        res.json({
            message: 'User statistics retrieved successfully',
            data: {
                userTypes: {
                    taskGivers,
                    taskDoers
                }
            }
        });
    } catch (error) {
        console.error('Error fetching user statistics:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to fetch user statistics'
        });
        return;
    }
}));

/**
 * GET /api/users
 * Get paginated list of users with filtering and sorting
 */
router.get('/', [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('userMode').optional().isIn(['taskGiver', 'taskDoer']),
    query('isActive').optional().isBoolean(),
    query('isVerified').optional().isBoolean(),
    query('sortBy').optional().isIn(['createdAt', 'lastLogin', 'balance', 'totalEarned', 'totalSpent']),
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
    const userMode = req.query.userMode as string;
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const isVerified = req.query.isVerified === 'true' ? true : req.query.isVerified === 'false' ? false : undefined;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
        where[Op.or] = [
            { firstName: { [Op.like]: `%${search}%` } },
            { lastName: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { username: { [Op.like]: `%${search}%` } }
        ];
    }

    if (userMode) {
        where.userMode = userMode;
    }

    if (isActive !== undefined) {
        where.isActive = isActive;
    }

    // Note: isVerified is not a field in the User model, so we'll skip it

    try {
        // Get users with pagination
        const { rows: users, count: total } = await User.findAndCountAll({
            where,
            order: [[sortBy, sortOrder.toUpperCase()]],
            limit,
            offset,
            attributes: { exclude: ['password'] } // Exclude password field
        });

        const totalPages = Math.ceil(total / limit);

        // Add counts for each user
        const usersWithCounts = await Promise.all(users.map(async (user: any) => {
            try {
                // For now, we'll return 0 for counts since we don't have the related models yet
                return {
                    ...user.toJSON(),
                    _count: {
                        orders: 0,
                        tasks: 0,
                        socialAccounts: 0
                    }
                };
            } catch (countError) {
                console.error('Error counting user relations:', countError);
                return {
                    ...user.toJSON(),
                    _count: {
                        orders: 0,
                        tasks: 0,
                        socialAccounts: 0
                    }
                };
            }
        }));

        res.json({
            message: 'Users retrieved successfully',
            data: {
                users: usersWithCounts,
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
        console.error('Error fetching users:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to fetch users'
        });
        return;
    }
}));

/**
 * GET /api/users/:id
 * Get detailed user information
 */
router.get('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Get user
        const user: UserAttributes | null = await User.findByPk(id, {
            attributes: { exclude: ['password'] } // Exclude password field
        }) as unknown as UserAttributes | null;

        if (!user) {
            res.status(404).json({
                error: 'Not Found',
                message: 'User not found'
            });
            return;
        }

        // For now, we'll return empty arrays for related data since we don't have the related models yet
        res.json({
            message: 'User details retrieved successfully',
            data: {
                user: {
                    ...user,
                    orders: [],
                    tasks: [],
                    socialAccounts: [],
                    transactions: [],
                    devices: [],
                    referrals: [],
                    referrer: null
                }
            }
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to fetch user details'
        });
        return;
    }
}));

/**
 * POST /api/users
 * Create a new user (admin only)
 */
router.post('/', requireAdminOrAbove, logAdminActivity('CREATE', 'user'), [
    body('email').isEmail().normalizeEmail(),
    body('username').isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
    body('firstName').isLength({ min: 1, max: 50 }).trim(),
    body('lastName').isLength({ min: 1, max: 50 }).trim(),
    body('password').isLength({ min: 8 }),
    body('phone').optional().isMobilePhone('any'),
    body('userMode').optional().isIn(['taskGiver', 'taskDoer'])
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

    const {
        email, username, firstName, lastName, password,
        phone, userMode
    } = req.body;

    try {
        // Check if email or username already exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser) {
            res.status(409).json({
                error: 'Conflict',
                message: existingUser.email === email ? 'Email already exists' : 'Username already exists'
            });
            return;
        }

        // Validate password
        const passwordValidation = AuthUtils.validatePassword(password);
        if (!passwordValidation.isValid) {
            res.status(400).json({
                error: 'Validation Error',
                message: 'Password does not meet requirements',
                details: passwordValidation.errors
            });
            return;
        }

        // Create user
        const user = await User.create({
            email,
            username,
            firstName,
            lastName,
            password,
            phone,
            userMode: userMode || 'taskDoer',
            role: 'user'
        });

        res.status(201).json({
            message: 'User created successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    userMode: user.userMode,
                    role: user.role,
                    balance: user.balance,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to create user'
        });
        return;
    }
}));

/**
 * PUT /api/users/:id
 * Update user information
 */
router.put('/:id', requireAdminOrAbove, logAdminActivity('UPDATE', 'user'), [
    body('firstName').optional().isLength({ min: 1, max: 50 }).trim(),
    body('lastName').optional().isLength({ min: 1, max: 50 }).trim(),
    body('phone').optional().isMobilePhone('any'),
    body('userMode').optional().isIn(['taskGiver', 'taskDoer']),
    body('isActive').optional().isBoolean()
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
    const updateData = req.body;

    try {
        // Check if user exists
        const user = await User.findByPk(id);
        if (!user) {
            res.status(404).json({
                error: 'Not Found',
                message: 'User not found'
            });
            return;
        }

        // Update user
        await user.update(updateData);

        res.json({
            message: 'User updated successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    userMode: user.userMode,
                    role: user.role,
                    balance: user.balance,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to update user'
        });
        return;
    }
}));

/**
 * DELETE /api/users/:id
 * Delete a user (admin only)
 */
router.delete('/:id', requireAdminOrAbove, logAdminActivity('DELETE', 'user'), asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Check if user exists
        const user = await User.findByPk(id);
        if (!user) {
            res.status(404).json({
                error: 'Not Found',
                message: 'User not found'
            });
            return;
        }

        // Delete user
        await user.destroy();

        res.json({
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            error: 'Database Error',
            message: 'Failed to delete user'
        });
        return;
    }
}));

export { router as adminUserRoutes };
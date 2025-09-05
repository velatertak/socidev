import { Request, Response, NextFunction } from 'express';
import { AuthUtils } from '@/utils/auth';
import { logger } from '@/utils/logger';
import { Sequelize, DataTypes } from 'sequelize';

// Connect to the main project's database using Sequelize
const mainDb = new Sequelize(
    process.env.MAIN_DB_NAME || 'social_developer',
    process.env.MAIN_DB_USER || 'root',
    process.env.MAIN_DB_PASS || '',
    {
        host: process.env.MAIN_DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false
    }
);

// Define the User model to match the main project's structure
const MainUser: any = mainDb.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'first_name'
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'last_name'
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    role: {
        type: DataTypes.ENUM('user', 'moderator', 'admin', 'super_admin'),
        defaultValue: 'user'
    },
    userMode: {
        type: DataTypes.ENUM('taskDoer', 'taskGiver'),
        defaultValue: 'taskDoer',
        field: 'user_mode'
    },
    createdAt: {
        type: DataTypes.DATE,
        field: 'created_at'
    },
    updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at'
    }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true
});

export interface AuthenticatedRequest extends Request {
    admin?: {
        id: string;
        email: string;
        role: string;
        firstName: string;
        lastName: string;
    };
}

/**
 * Middleware to authenticate admin users with integrated auth
 */
export const authenticateAdminIntegrated = async (
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
        const payload: any = AuthUtils.verifyToken(token);

        // Check if user exists and has admin role in the main database
        const user: any = await MainUser.findByPk(payload.adminId);

        if (!user) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Admin not found'
            });
            return;
        }

        // Check if user has admin role
        // Fix: Check for admin role in a case-insensitive way and allow super_admin
        const userRole = user.role?.toLowerCase();
        if (userRole !== 'admin' && userRole !== 'super_admin') {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Insufficient privileges'
            });
            return;
        }

        // Attach admin info to request
        req.admin = {
            id: user.id,
            email: user.email,
            role: userRole.toUpperCase(), // Convert to uppercase to match frontend expectations
            firstName: user.firstName,
            lastName: user.lastName
        };

        // Log admin activity
        logger.info('Admin authenticated (integrated)', {
            adminId: user.id,
            email: user.email,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            method: req.method
        });

        next();
    } catch (error) {
        logger.error('Authentication error (integrated):', error);
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid token'
        });
    }
};
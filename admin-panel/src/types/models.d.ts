import { Model, Optional } from 'sequelize';

// User model types
interface UserAttributes {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
    phone?: string;
    balance: number;
    role: 'user' | 'moderator' | 'admin' | 'super_admin';
    userMode: 'taskDoer' | 'taskGiver';
    createdAt?: Date;
    updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'phone' | 'balance' | 'createdAt' | 'updatedAt'> { }

// Admin model types
interface AdminAttributes {
    id: number;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    password: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';
    isActive: boolean;
    lastLogin?: Date;
    profileImage?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface AdminCreationAttributes extends Optional<AdminAttributes, 'id' | 'lastLogin' | 'profileImage' | 'createdAt' | 'updatedAt'> { }

// AdminSession model types
interface AdminSessionAttributes {
    id: string;
    adminId: number;
    token: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
    createdAt?: Date;
}

interface AdminSessionCreationAttributes extends Optional<AdminSessionAttributes, 'id' | 'ipAddress' | 'userAgent' | 'createdAt'> { }

// AdminActivity model types
interface AdminActivityAttributes {
    id: string;
    adminId: number;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt?: Date;
}

interface AdminActivityCreationAttributes extends Optional<AdminActivityAttributes, 'id' | 'resourceId' | 'details' | 'ipAddress' | 'userAgent' | 'createdAt'> { }

// Order model types
interface OrderAttributes {
    id: string;
    userId: string;
    platform: 'YOUTUBE' | 'INSTAGRAM' | 'TIKTOK' | 'TWITTER' | 'FACEBOOK';
    serviceType: string;
    targetUrl: string;
    quantity: number;
    startCount: number;
    remainingCount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
    speed: string;
    amount: number;
    description?: string;
    adminNotes?: string;
    approvedBy?: string;
    approvedAt?: Date;
    rejectedBy?: string;
    rejectedAt?: Date;
    rejectionReason?: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'startCount' | 'remainingCount' | 'status' | 'speed' | 'amount' | 'description' | 'adminNotes' | 'approvedBy' | 'approvedAt' | 'rejectedBy' | 'rejectedAt' | 'rejectionReason' | 'updatedBy' | 'createdAt' | 'updatedAt'> { }

// Task model types
interface TaskAttributes {
    id: string;
    userId: string;
    orderId?: string;
    platform: 'YOUTUBE' | 'INSTAGRAM' | 'TIKTOK' | 'TWITTER' | 'FACEBOOK';
    serviceType: string;
    targetUrl: string;
    description?: string;
    reward: number;
    status: 'available' | 'in_progress' | 'completed' | 'approved' | 'rejected';
    proof?: string;
    completedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

interface TaskCreationAttributes extends Optional<TaskAttributes, 'id' | 'orderId' | 'description' | 'proof' | 'completedAt' | 'createdAt' | 'updatedAt'> { }

// Transaction model types
interface TransactionAttributes {
    id: string;
    userId: string;
    orderId?: string;
    type: 'deposit' | 'withdrawal' | 'order_payment' | 'task_earning';
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    method: 'bank_transfer' | 'credit_card' | 'crypto' | 'balance';
    details?: any;
    reference?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'id' | 'orderId' | 'details' | 'reference' | 'createdAt' | 'updatedAt'> { }

// Declare model types
export {
    UserAttributes,
    UserCreationAttributes,
    AdminAttributes,
    AdminCreationAttributes,
    AdminSessionAttributes,
    AdminSessionCreationAttributes,
    AdminActivityAttributes,
    AdminActivityCreationAttributes,
    OrderAttributes,
    OrderCreationAttributes,
    TaskAttributes,
    TaskCreationAttributes,
    TransactionAttributes,
    TransactionCreationAttributes
};
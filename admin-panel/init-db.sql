-- Database initialization script for Social Developer Admin Panel

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'SUPER_ADMIN') DEFAULT 'ADMIN',
    isActive BOOLEAN DEFAULT TRUE,
    lastLogin DATETIME,
    profileImage VARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create admin_sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id VARCHAR(36) PRIMARY KEY,
    adminId VARCHAR(36) NOT NULL,
    token TEXT NOT NULL,
    expiresAt DATETIME NOT NULL,
    ipAddress VARCHAR(45),
    userAgent TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adminId) REFERENCES admins(id) ON DELETE CASCADE
);

-- Create admin_activities table
CREATE TABLE IF NOT EXISTS admin_activities (
    id VARCHAR(36) PRIMARY KEY,
    adminId VARCHAR(36) NOT NULL,
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    resourceId VARCHAR(36),
    details JSON,
    ipAddress VARCHAR(45),
    userAgent TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adminId) REFERENCES admins(id) ON DELETE CASCADE
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    dateOfBirth DATE,
    gender ENUM('MALE', 'FEMALE', 'OTHER'),
    country VARCHAR(100),
    city VARCHAR(100),
    profileImage VARCHAR(255),
    isActive BOOLEAN DEFAULT TRUE,
    isVerified BOOLEAN DEFAULT FALSE,
    userMode ENUM('TASK_DOER', 'TASK_GIVER') DEFAULT 'TASK_DOER',
    balance DECIMAL(10, 2) DEFAULT 0.00,
    totalEarned DECIMAL(10, 2) DEFAULT 0.00,
    totalSpent DECIMAL(10, 2) DEFAULT 0.00,
    referralCode VARCHAR(36) UNIQUE,
    referredBy VARCHAR(36),
    lastLogin DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create social_accounts table
CREATE TABLE IF NOT EXISTS social_accounts (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    platform ENUM('YOUTUBE', 'INSTAGRAM', 'TIKTOK', 'TWITTER', 'FACEBOOK') NOT NULL,
    username VARCHAR(255) NOT NULL,
    displayName VARCHAR(255),
    accountId VARCHAR(255),
    accessToken TEXT,
    refreshToken TEXT,
    followers INT DEFAULT 0,
    following INT DEFAULT 0,
    posts INT DEFAULT 0,
    engagementRate DECIMAL(5, 2) DEFAULT 0.00,
    isActive BOOLEAN DEFAULT TRUE,
    lastSync DATETIME,
    metadata JSON,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_platform_username (userId, platform, username)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    socialAccountId VARCHAR(36),
    platform ENUM('YOUTUBE', 'INSTAGRAM', 'TIKTOK', 'TWITTER', 'FACEBOOK') NOT NULL,
    serviceType ENUM('LIKES', 'FOLLOWERS', 'SUBSCRIBERS', 'VIEWS', 'COMMENTS', 'SHARES') NOT NULL,
    targetUrl TEXT NOT NULL,
    quantity INT NOT NULL,
    pricePerUnit DECIMAL(10, 4) NOT NULL,
    totalPrice DECIMAL(10, 2) NOT NULL,
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REFUNDED') DEFAULT 'PENDING',
    completedCount INT DEFAULT 0,
    startTime DATETIME,
    completionTime DATETIME,
    description TEXT,
    requirements JSON,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (socialAccountId) REFERENCES social_accounts(id) ON DELETE SET NULL
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY,
    orderId VARCHAR(36) NOT NULL,
    userId VARCHAR(36) NOT NULL,
    socialAccountId VARCHAR(36),
    platform ENUM('YOUTUBE', 'INSTAGRAM', 'TIKTOK', 'TWITTER', 'FACEBOOK') NOT NULL,
    serviceType ENUM('LIKES', 'FOLLOWERS', 'SUBSCRIBERS', 'VIEWS', 'COMMENTS', 'SHARES') NOT NULL,
    targetUrl TEXT NOT NULL,
    status ENUM('AVAILABLE', 'CLAIMED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED', 'EXPIRED') DEFAULT 'AVAILABLE',
    reward DECIMAL(10, 2) NOT NULL,
    requirements JSON,
    proof JSON,
    submittedAt DATETIME,
    approvedAt DATETIME,
    rejectedAt DATETIME,
    rejectionReason TEXT,
    expiresAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (socialAccountId) REFERENCES social_accounts(id) ON DELETE SET NULL
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    orderId VARCHAR(36),
    type ENUM('DEPOSIT', 'WITHDRAWAL', 'ORDER_PAYMENT', 'TASK_REWARD', 'REFUND', 'COMMISSION') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED') DEFAULT 'PENDING',
    reference VARCHAR(255),
    metadata JSON,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE SET NULL
);

-- Insert default admin user
INSERT IGNORE INTO admins (id, email, username, firstName, lastName, password, role, isActive) 
VALUES ('cmeysyrco0000g6oqs0wtj71t', 'admin@socialdev.com', 'admin', 'Super', 'Admin', '$2a$10$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO', 'SUPER_ADMIN', TRUE);

-- Create indexes for better performance
CREATE INDEX idx_orders_user_id ON orders(userId);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_platform ON orders(platform);
CREATE INDEX idx_tasks_order_id ON tasks(orderId);
CREATE INDEX idx_tasks_user_id ON tasks(userId);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_transactions_user_id ON transactions(userId);
CREATE INDEX idx_transactions_order_id ON transactions(orderId);
CREATE INDEX idx_transactions_type ON transactions(type);
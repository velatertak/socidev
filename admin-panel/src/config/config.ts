import { config as dotenvConfig } from 'dotenv';

// Load environment variables
dotenvConfig();

interface Config {
    // Server
    port: number;
    nodeEnv: string;

    // Database
    databaseUrl: string;

    // JWT
    jwtSecret: string;
    jwtExpiresIn: string;

    // Admin defaults
    defaultAdminEmail: string;
    defaultAdminPassword: string;
    defaultAdminUsername: string;

    // CORS
    corsOrigin: string | string[];

    // Rate limiting
    rateLimitWindow: number;
    rateLimitMaxRequests: number;

    // File upload
    uploadMaxSize: number;
    uploadAllowedTypes: string[];

    // Email
    emailHost: string;
    emailPort: number;
    emailUser: string;
    emailPass: string;
    emailFrom: string;

    // Logging
    logLevel: string;
    logFile: string;
}

export const config: Config = {
    // Server
    port: parseInt(process.env.PORT || '5001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database
    databaseUrl: process.env.DATABASE_URL || '',

    // JWT
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key-change-this',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

    // Admin defaults
    defaultAdminEmail: process.env.DEFAULT_ADMIN_EMAIL || 'admin@socialdev.com',
    defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123!',
    defaultAdminUsername: process.env.DEFAULT_ADMIN_USERNAME || 'admin',

    // CORS
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],

    // Rate limiting
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

    // File upload
    uploadMaxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880', 10), // 5MB
    uploadAllowedTypes: process.env.UPLOAD_ALLOWED_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/gif'],

    // Email
    emailHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
    emailPort: parseInt(process.env.EMAIL_PORT || '587', 10),
    emailUser: process.env.EMAIL_USER || '',
    emailPass: process.env.EMAIL_PASS || '',
    emailFrom: process.env.EMAIL_FROM || 'noreply@socialdev.com',

    // Logging
    logLevel: process.env.LOG_LEVEL || 'info',
    logFile: process.env.LOG_FILE || 'logs/admin.log'
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}
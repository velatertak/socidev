import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from '@/config/config';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { adminAuthRoutes } from '@/routes/auth';
import { adminUserRoutes } from '@/routes/users';
import { adminOrderRoutes } from '@/routes/orders';
import { adminTaskRoutes } from '@/routes/tasks';
import { adminAnalyticsRoutes } from '@/routes/analytics';
import { adminSettingsRoutes } from '@/routes/settings';
import { adminDashboardRoutes } from '@/routes/dashboard';
import { adminBalanceRoutes } from '@/routes/balance';
// Import the integrated auth routes
import { adminAuthIntegratedRoutes } from '@/routes/auth-integrated';
import sequelize from '@/config/database.js';

class AdminServer {
    private app: express.Application;

    constructor() {
        console.log('Creating AdminServer instance...');
        this.app = express();
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
        console.log('AdminServer instance created successfully');
    }

    private initializeMiddleware(): void {
        console.log('Initializing middleware...');
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https:"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'"],
                    fontSrc: ["'self'", "https:"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'none'"]
                }
            }
        }));

        // CORS configuration
        this.app.use(cors({
            origin: config.corsOrigin,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: config.rateLimitWindow * 60 * 1000, // 15 minutes
            max: config.rateLimitMaxRequests,
            message: {
                error: 'Too many requests from this IP, please try again later.'
            },
            standardHeaders: true,
            legacyHeaders: false
        });
        this.app.use('/api/', limiter);

        // Compression and parsing
        this.app.use(compression());
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Request logging
        this.app.use((req, res, next) => {
            logger.info(`${req.method} ${req.path}`, {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                timestamp: new Date().toISOString()
            });
            next();
        });
        console.log('Middleware initialized successfully');
    }

    private initializeRoutes(): void {
        console.log('Initializing routes...');
        // Health check
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: config.nodeEnv
            });
        });

        // API routes
        // Use integrated auth routes if INTEGRATED_AUTH is set to true, otherwise use original auth routes
        if (process.env.INTEGRATED_AUTH === 'true') {
            this.app.use('/api/auth', adminAuthIntegratedRoutes);
        } else {
            this.app.use('/api/auth', adminAuthRoutes);
        }
        this.app.use('/api/dashboard', adminDashboardRoutes);
        this.app.use('/api/admin/users', adminUserRoutes);
        this.app.use('/api/admin/orders', adminOrderRoutes);
        this.app.use('/api/admin/tasks', adminTaskRoutes);
        this.app.use('/api/admin/balance', adminBalanceRoutes);
        this.app.use('/api/analytics', adminAnalyticsRoutes);
        this.app.use('/api/settings', adminSettingsRoutes);

        // Serve admin panel static files in production
        if (config.nodeEnv === 'production') {
            this.app.use(express.static('public'));
            this.app.get('*', (req, res) => {
                res.sendFile('index.html', { root: 'public' });
            });
        }

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Endpoint not found',
                message: `Cannot ${req.method} ${req.originalUrl}`
            });
        });
        console.log('Routes initialized successfully');
    }

    private initializeErrorHandling(): void {
        console.log('Initializing error handling...');
        this.app.use(errorHandler);
        console.log('Error handling initialized successfully');
    }

    public async start(): Promise<void> {
        try {
            console.log('Starting server...');
            // Test database connection
            console.log('Testing database connection...');
            await sequelize.authenticate();
            console.log('Connected to database successfully');

            // Start server
            const PORT = config.port;
            console.log(`Starting server on port ${PORT}...`);
            this.app.listen(PORT, () => {
                console.log(`Admin panel server running on port ${PORT}`, {
                    environment: config.nodeEnv,
                    pid: process.pid
                });
            });
            console.log('Server started successfully');

            // Graceful shutdown
            process.on('SIGINT', () => this.shutdown());
            process.on('SIGTERM', () => this.shutdown());

        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }

    private async shutdown(): Promise<void> {
        console.log('Shutting down server gracefully...');

        try {
            await sequelize.close();
            console.log('Database connection closed');
            process.exit(0);
        } catch (error) {
            console.error('Error during shutdown:', error);
            process.exit(1);
        }
    }
}

// Start the server
console.log('Creating server instance...');
const server = new AdminServer();
console.log('Starting server...');
server.start().catch((error) => {
    console.error('Server startup failed:', error);
    process.exit(1);
});
import winston from 'winston';
import { config } from '@/config/config';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = path.dirname(config.logFile);
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let metaStr = '';
        if (Object.keys(meta).length > 0) {
            metaStr = ` ${JSON.stringify(meta)}`;
        }
        return `[${timestamp}] ${level}: ${message}${metaStr}`;
    })
);

// Custom format for file output
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Create logger
export const logger = winston.createLogger({
    level: config.logLevel,
    format: fileFormat,
    defaultMeta: { service: 'admin-panel' },
    transports: [
        // File transport for all logs
        new winston.transports.File({
            filename: config.logFile,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),

        // Separate file for errors
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// Add console transport for development
if (config.nodeEnv !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat
    }));
}

// Log unhandled promise rejections and exceptions
logger.exceptions.handle(
    new winston.transports.File({
        filename: path.join(logsDir, 'exceptions.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 3
    })
);

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', { promise, reason });
});

export default logger;
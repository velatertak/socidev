import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '@/config/config';

export interface JwtPayload {
    adminId: number;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

export class AuthUtils {
    /**
     * Hash a password using bcrypt
     */
    static async hashPassword(password: string): Promise<string> {
        const saltRounds = 12;
        return bcrypt.hash(password, saltRounds);
    }

    /**
     * Compare a plain password with a hashed password
     */
    static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

    /**
     * Generate a JWT token
     */
    static generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
        return jwt.sign(payload as any, config.jwtSecret, {
            expiresIn: config.jwtExpiresIn
        } as any);
    }

    /**
     * Verify and decode a JWT token
     */
    static verifyToken(token: string): JwtPayload {
        try {
            return jwt.verify(token, config.jwtSecret) as JwtPayload;
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    /**
     * Generate a random token for session management
     */
    static generateSessionToken(): string {
        return jwt.sign(
            {
                random: Math.random(),
                timestamp: Date.now()
            } as any,
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn } as any
        );
    }

    /**
     * Calculate token expiration date
     */
    static getTokenExpiration(): Date {
        const expiresIn = config.jwtExpiresIn;
        const now = new Date();

        // Parse the expires in format (e.g., "7d", "24h", "60m")
        const timeUnit = expiresIn.slice(-1);
        const timeValue = parseInt(expiresIn.slice(0, -1));

        switch (timeUnit) {
            case 'd':
                return new Date(now.getTime() + timeValue * 24 * 60 * 60 * 1000);
            case 'h':
                return new Date(now.getTime() + timeValue * 60 * 60 * 1000);
            case 'm':
                return new Date(now.getTime() + timeValue * 60 * 1000);
            default:
                return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Default 7 days
        }
    }

    /**
     * Validate password strength
     */
    static validatePassword(password: string): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Generate a secure random password
     */
    static generateRandomPassword(length: number = 12): string {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*(),.?":{}|<>';
        const allChars = uppercase + lowercase + numbers + symbols;

        let password = '';

        // Ensure at least one character from each category
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];

        // Fill the rest with random characters
        for (let i = 4; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }

        // Shuffle the password
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }
}
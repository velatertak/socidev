import { config } from '../config/config';
import { logger } from '../utils/logger';
import { AuthUtils } from '../utils/auth';
import Admin from '@/models/Admin.js';

async function seedDatabase() {
    try {
        logger.info('Starting database seeding...');

        // Create default super admin
        const existingSuperAdmin = await Admin.findOne({
            where: { role: 'SUPER_ADMIN' }
        });

        if (!existingSuperAdmin) {
            const hashedPassword = await AuthUtils.hashPassword(config.defaultAdminPassword);

            const superAdmin = await Admin.create({
                email: config.defaultAdminEmail,
                username: config.defaultAdminUsername,
                firstName: 'Super',
                lastName: 'Admin',
                password: hashedPassword,
                role: 'SUPER_ADMIN',
                isActive: true
            });

            logger.info(`Created super admin: ${superAdmin.email}`);
        } else {
            logger.info('Super admin already exists');
        }

        logger.info('Database seeding completed successfully');

    } catch (error) {
        logger.error('Database seeding failed:', error);
        throw error;
    }
}

// Run seeding if called directly
if (require.main === module) {
    seedDatabase()
        .then(() => {
            logger.info('Seeding process finished');
            process.exit(0);
        })
        .catch((error) => {
            logger.error('Seeding process failed:', error);
            process.exit(1);
        });
}

export { seedDatabase };
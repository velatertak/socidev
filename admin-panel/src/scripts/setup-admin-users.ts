import { Sequelize, DataTypes, Op } from 'sequelize';
import * as bcrypt from 'bcryptjs';
import { config } from '../config/config';
import { logger } from '../utils/logger';

// Connect to the main project's database
const sequelize = new Sequelize(
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
const User: any = sequelize.define('User', {
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
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user'
    }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true
});

async function setupAdminUsers() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database successfully');

        // Check if the default admin user exists
        const existingAdmin = await User.findOne({
            where: {
                email: config.defaultAdminEmail
            }
        });

        if (existingAdmin) {
            // Update the existing user to have admin role
            await User.update(
                { role: 'admin' },
                { where: { email: config.defaultAdminEmail } }
            );
            console.log(`Updated existing user ${config.defaultAdminEmail} to admin role`);
        } else {
            // Create a new admin user
            const hashedPassword = await bcrypt.hash(config.defaultAdminPassword, 12);

            await User.create({
                email: config.defaultAdminEmail,
                username: config.defaultAdminUsername,
                firstName: 'Admin',
                lastName: 'User',
                password: hashedPassword,
                role: 'admin'
            });

            console.log(`Created new admin user: ${config.defaultAdminEmail}`);
        }

        // Also update any existing users with email ending in @socialdev.com to admin role
        const socialDevAdmins = await User.findAll({
            where: {
                email: {
                    [Op.like]: '%@socialdev.com'
                }
            }
        });

        for (const user of socialDevAdmins) {
            await User.update(
                { role: 'admin' },
                { where: { id: user.id } }
            );
            console.log(`Updated user ${user.email} to admin role`);
        }

        console.log('Admin user setup completed');
    } catch (error) {
        console.error('Error setting up admin users:', error);
    } finally {
        await sequelize.close();
    }
}

// Run the script if called directly
if (require.main === module) {
    setupAdminUsers();
}

export { setupAdminUsers };
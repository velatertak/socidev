const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

// Connect to the database
const sequelize = new Sequelize(
    process.env.DB_NAME || 'social_developer',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false
    }
);

// Define the User model to match the main project's structure
const User = sequelize.define('User', {
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
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user'
    },
    userMode: {
        type: DataTypes.ENUM('taskDoer', 'taskGiver'),
        defaultValue: 'taskDoer',
        field: 'user_mode'
    }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true
});

async function createUsers() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database successfully');

        // Create admin user
        const adminEmail = 'admin@socialdev.com';
        const adminPassword = 'admin123!';
        const adminUsername = 'admin';
        
        const existingAdmin = await User.findOne({
            where: { email: adminEmail }
        });

        if (existingAdmin) {
            console.log(`Admin user ${adminEmail} already exists`);
        } else {
            const hashedPassword = await bcrypt.hash(adminPassword, 12);
            await User.create({
                email: adminEmail,
                username: adminUsername,
                firstName: 'Admin',
                lastName: 'User',
                password: hashedPassword,
                role: 'admin',
                userMode: 'taskDoer'
            });
            console.log(`Created admin user: ${adminEmail}`);
        }

        // Create task doer user
        const taskDoerEmail = 'taskdoer@socialdev.com';
        const taskDoerPassword = 'taskdoer123!';
        const taskDoerUsername = 'taskdoer';
        
        const existingTaskDoer = await User.findOne({
            where: { email: taskDoerEmail }
        });

        if (existingTaskDoer) {
            console.log(`Task doer user ${taskDoerEmail} already exists`);
        } else {
            const hashedPassword = await bcrypt.hash(taskDoerPassword, 12);
            await User.create({
                email: taskDoerEmail,
                username: taskDoerUsername,
                firstName: 'Task',
                lastName: 'Doer',
                password: hashedPassword,
                role: 'user',
                userMode: 'taskDoer'
            });
            console.log(`Created task doer user: ${taskDoerEmail}`);
        }

        // Create task giver user
        const taskGiverEmail = 'taskgiver@socialdev.com';
        const taskGiverPassword = 'taskgiver123!';
        const taskGiverUsername = 'taskgiver';
        
        const existingTaskGiver = await User.findOne({
            where: { email: taskGiverEmail }
        });

        if (existingTaskGiver) {
            console.log(`Task giver user ${taskGiverEmail} already exists`);
        } else {
            const hashedPassword = await bcrypt.hash(taskGiverPassword, 12);
            await User.create({
                email: taskGiverEmail,
                username: taskGiverUsername,
                firstName: 'Task',
                lastName: 'Giver',
                password: hashedPassword,
                role: 'user',
                userMode: 'taskGiver'
            });
            console.log(`Created task giver user: ${taskGiverEmail}`);
        }

        console.log('All users created successfully!');
        
        // Display login information
        console.log('\n--- LOGIN INFORMATION ---');
        console.log('Admin User:');
        console.log(`  Email: ${adminEmail}`);
        console.log(`  Password: ${adminPassword}`);
        console.log(`  Role: admin`);
        console.log(`  Mode: taskDoer`);
        console.log('');
        console.log('Task Doer User:');
        console.log(`  Email: ${taskDoerEmail}`);
        console.log(`  Password: ${taskDoerPassword}`);
        console.log(`  Role: user`);
        console.log(`  Mode: taskDoer`);
        console.log('');
        console.log('Task Giver User:');
        console.log(`  Email: ${taskGiverEmail}`);
        console.log(`  Password: ${taskGiverPassword}`);
        console.log(`  Role: user`);
        console.log(`  Mode: taskGiver`);
        console.log('');

    } catch (error) {
        console.error('Error creating users:', error);
    } finally {
        await sequelize.close();
    }
}

// Run the script if called directly
if (require.main === module) {
    createUsers();
}

module.exports = { createUsers };
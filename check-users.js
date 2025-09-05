const { Sequelize, DataTypes } = require('sequelize');

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
const MainUser = mainDb.define('User', {
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

async function checkAdminUsers() {
    try {
        await mainDb.authenticate();
        console.log('Connection has been established successfully.');
        
        // Find all users with admin or super_admin role
        const admins = await MainUser.findAll({
            where: {
                role: {
                    [Sequelize.Op.in]: ['admin', 'super_admin']
                }
            },
            attributes: ['id', 'email', 'role', 'firstName', 'lastName']
        });
        
        console.log('Admin users found:', admins.length);
        admins.forEach(admin => {
            console.log(`- ${admin.email} (${admin.firstName} ${admin.lastName}) - Role: ${admin.role}`);
        });
        
        // Update the admin user to super_admin
        if (admins.length > 0) {
            const adminUser = admins[0];
            if (adminUser.role !== 'super_admin') {
                await MainUser.update(
                    { role: 'super_admin' },
                    { where: { id: adminUser.id } }
                );
                console.log(`Updated user ${adminUser.email} to super_admin role`);
            } else {
                console.log(`User ${adminUser.email} already has super_admin role`);
            }
        }
        
        await mainDb.close();
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

checkAdminUsers();
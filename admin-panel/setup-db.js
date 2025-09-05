import sequelize from './src/config/database.js';
import { Admin } from './src/models/Admin.js';
import { User } from './src/models/User.js';
import { Order } from './src/models/Order.js';
import { Task } from './src/models/Task.js';

async function setupDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected to database successfully');

    // Sync all models
    await sequelize.sync();
    console.log('Database models synchronized');

    // Check if admins table exists by trying to find the default admin
    try {
      const adminCount = await Admin.count();
      console.log(`Found ${adminCount} admin records`);
      
      if (adminCount === 0) {
        console.log('Creating default admin user...');
        await Admin.create({
          id: 'cmeysyrco0000g6oqs0wtj71t',
          email: 'admin@socialdev.com',
          username: 'admin',
          firstName: 'Super',
          lastName: 'Admin',
          password: '$2a$10$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO', // bcrypt hash for 'admin123!'
          role: 'SUPER_ADMIN',
          isActive: true
        });
        console.log('Default admin user created successfully');
      } else {
        console.log('Admin users already exist');
      }
    } catch (error) {
      console.log('Error checking admin records:', error.message);
    }

    // Check if users table exists
    try {
      const userCount = await User.count();
      console.log(`Found ${userCount} user records`);
    } catch (error) {
      console.log('Error checking user records:', error.message);
    }

    // Check if orders table exists
    try {
      const orderCount = await Order.count();
      console.log(`Found ${orderCount} order records`);
    } catch (error) {
      console.log('Error checking order records:', error.message);
    }

    // Check if tasks table exists
    try {
      const taskCount = await Task.count();
      console.log(`Found ${taskCount} task records`);
    } catch (error) {
      console.log('Error checking task records:', error.message);
    }

    console.log('Database inspection completed');
  } catch (error) {
    console.error('Failed to inspect database:', error);
  }
}

setupDatabase();
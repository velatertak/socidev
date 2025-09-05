import sequelize from './src/config/database.js';
import { Admin } from './src/models/Admin.js';

async function initializeDatabase() {
  try {
    console.log('Connecting to database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('Connected to database successfully');
    
    // Sync all models
    await sequelize.sync();
    console.log('Database models synchronized');
    
    // Check if admins table exists by trying to find the default admin
    try {
      const admin = await Admin.findOne({
        where: { email: 'admin@socialdev.com' }
      });
      
      if (admin) {
        console.log('Default admin user already exists');
      } else {
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
      }
    } catch (error) {
      console.log('Error checking admin records:', error.message);
    }
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

initializeDatabase();
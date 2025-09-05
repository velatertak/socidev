import sequelize from './src/config/database.js';

async function fixDatabaseSchema() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected to database successfully');

    // List all tables
    const tables = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'social_developer'",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('Database tables:');
    tables.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    // Check orders table structure
    try {
      const ordersColumns = await sequelize.query(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'social_developer' AND table_name = 'orders'",
        { type: sequelize.QueryTypes.SELECT }
      );
      
      console.log('\nOrders table columns:');
      ordersColumns.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type})`);
      });
    } catch (error) {
      console.log('Could not get orders table structure:', error.message);
    }
    
    // Check tasks table structure
    try {
      const tasksColumns = await sequelize.query(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'social_developer' AND table_name = 'tasks'",
        { type: sequelize.QueryTypes.SELECT }
      );
      
      console.log('\nTasks table columns:');
      tasksColumns.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type})`);
      });
    } catch (error) {
      console.log('Could not get tasks table structure:', error.message);
    }
    
    console.log('\nDatabase schema inspection completed');
  } catch (error) {
    console.error('Failed to inspect database schema:', error);
  }
}

fixDatabaseSchema();
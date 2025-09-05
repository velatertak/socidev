import sequelize from './src/config/database.js';

async function checkTables() {
  try {
    // Try to get table information
    const result = await sequelize.query('SHOW TABLES', { type: sequelize.QueryTypes.SHOWTABLES });
    console.log('Database tables:', result);
  } catch (error) {
    console.error('Error fetching tables:', error);
  }
}

checkTables();
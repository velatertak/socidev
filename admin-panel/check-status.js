import sequelize from './src/config/database.js';

async function checkStatusValues() {
  try {
    const statuses = await sequelize.query(
      'SELECT DISTINCT status FROM orders LIMIT 10',
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log('Status values in database:', statuses);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkStatusValues();
import { createConnection } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const checkOrdersColumns = async () => {
  let connection;
  
  try {
    connection = await createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'social_developer'
    });

    const [rows] = await connection.execute('DESCRIBE orders');
    console.log('Orders table columns:');
    rows.forEach(row => {
      console.log(`- ${row.Field} (${row.Type})`);
    });
  } catch (error) {
    console.error('Error checking orders columns:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

checkOrdersColumns();
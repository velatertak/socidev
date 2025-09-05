import sequelize from './src/config/database.js';
import { Order } from './src/models/Order.js';

async function checkOrders() {
  try {
    // Check if there are any orders in the database
    const orders = await sequelize.query('SELECT * FROM orders LIMIT 5', { type: sequelize.QueryTypes.SELECT });
    console.log('Sample orders:', orders);
    
    // Check order statistics
    const stats = await sequelize.query('SELECT status, COUNT(*) as count FROM orders GROUP BY status', { type: sequelize.QueryTypes.SELECT });
    console.log('Order statistics:', stats);
    
  } catch (error) {
    console.error('Error checking orders:', error);
  }
}

checkOrders();
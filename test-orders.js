const axios = require('axios');

async function testOrdersAPI() {
  try {
    // Test the orders endpoint
    const ordersResponse = await axios.get('http://localhost:5001/api/admin/orders', {
      headers: {
        'Authorization': 'Bearer YOUR_TEST_TOKEN_HERE'
      }
    });
    
    console.log('Orders Response:');
    console.log(JSON.stringify(ordersResponse.data, null, 2));
    
    // Test the statistics endpoint
    const statsResponse = await axios.get('http://localhost:5001/api/admin/orders/statistics/overview', {
      headers: {
        'Authorization': 'Bearer YOUR_TEST_TOKEN_HERE'
      }
    });
    
    console.log('\nStatistics Response:');
    console.log(JSON.stringify(statsResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error testing API:', error.response?.data || error.message);
  }
}

testOrdersAPI();
const axios = require('axios');

// First, let's login to get a token
async function testOrdersAPI() {
  try {
    // Login to get token
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@socialdev.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('Login successful, token obtained');
    
    // Test the orders endpoint
    const ordersResponse = await axios.get('http://localhost:5001/api/admin/orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Orders Response:');
    console.log(JSON.stringify(ordersResponse.data, null, 2));
    
    // Test the statistics endpoint
    const statsResponse = await axios.get('http://localhost:5001/api/admin/orders/statistics/overview', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('\nStatistics Response:');
    console.log(JSON.stringify(statsResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error testing API:', error.response?.data || error.message);
  }
}

testOrdersAPI();
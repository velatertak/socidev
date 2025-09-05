// Simple test to check authentication
const axios = require('axios');

async function testAuth() {
    try {
        // First, let's try to login
        const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'admin@socialdev.com',
            password: 'admin123'
        });
        
        console.log('Login successful');
        console.log('Response data:', loginResponse.data);
        console.log('Token:', loginResponse.data.data.token);
        console.log('Admin role:', loginResponse.data.data.admin.role);
        
        // Now try to access the users endpoint
        const usersResponse = await axios.get('http://localhost:5001/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${loginResponse.data.data.token}`
            }
        });
        
        console.log('Users endpoint access successful');
        console.log('Users count:', usersResponse.data.data.users.length);
        console.log('First user role:', usersResponse.data.data.users[0].role);
        
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testAuth();
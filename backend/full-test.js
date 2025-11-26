// Check if server is properly running and connected to database
const axios = require('axios');

console.log('Checking server status and database connection...');

// First check if the server is running
console.log('\n1. Testing server connectivity...');
axios.get('http://localhost:5000/')
    .then(response => {
        console.log('✅ Server is responding:', response.data);
        
        // Now test if database is working by checking products
        console.log('\n2. Testing database connectivity via products endpoint...');
        return axios.get('http://localhost:5000/api/products');
    })
    .then(response => {
        console.log('✅ Database connection works, got products:', response.data.length || 'No products');
        
        // Finally test the auth endpoint
        console.log('\n3. Testing auth endpoint with correct credentials...');
        return axios.post('http://localhost:5000/api/auth/login', {
            username: 'MUHAMMAD SHAYAN',
            password: 'Shayan1234$'
        });
    })
    .then(response => {
        console.log('✅ Auth endpoint works, login successful:', response.data.message);
        console.log('Token received (first 50 chars):', response.data.token.substring(0, 50) + '...');
    })
    .catch(error => {
        if (error.response) {
            console.log('❌ Error at step 3 (auth):', error.response.status, error.response.data);
        } else {
            console.log('❌ Network error:', error.message);
        }
    });
// Test the login API directly to see what's happening
const http = require('http');

const postData = JSON.stringify({
    username: 'MUHAMMAD SHAYAN',
    password: 'Shayan1234$'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('Testing API endpoint directly...');
console.log('POST http://localhost:5000/api/auth/login');
console.log('Data:', postData);

const req = http.request(options, (res) => {
    let data = '';
    
    console.log(`Response Status: ${res.statusCode}`);
    console.log('Response Headers:', res.headers);
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            console.log('Response Body:', response);
        } catch (e) {
            console.log('Response Body (not JSON):', data);
        }
    });
});

req.on('error', (e) => {
    console.error('Request error:', e.message);
    console.log('Make sure your server is running on http://localhost:5000');
});

req.write(postData);
req.end();
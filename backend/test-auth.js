// Test script to verify authentication
const { spawn } = require('child_process');
const { createWriteStream } = require('fs');

// Test credentials
const testCredentials = {
    username: 'MUHAMMAD SHAYAN',
    password: 'Shayan1234$'
};

console.log('Testing admin login...');
console.log('Username:', testCredentials.username);
console.log('Password:', testCredentials.password);

// Simple HTTP request using Node.js built-in modules
const http = require('http');

const postData = JSON.stringify(testCredentials);

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

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    res.on('data', (data) => {
        const response = JSON.parse(data);
        if (res.statusCode === 200) {
            console.log('✅ Login successful!');
            console.log('Response:', response);
        } else {
            console.log('❌ Login failed!');
            console.log('Error:', response);
        }
    });
    
    res.on('end', () => {
        console.log('Request completed');
    });
});

req.on('error', (e) => {
    console.error('❌ Request error:', e.message);
    console.log('Make sure your server is running on http://localhost:5000');
});

req.write(postData);
req.end();
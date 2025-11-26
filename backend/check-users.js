const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/store.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Connected to database');
});

db.all('SELECT id, username, email, role FROM users', [], (err, rows) => {
    if (err) {
        console.error('Error querying database:', err.message);
        db.close();
        return;
    }

    console.log('\n=== USERS IN DATABASE ===\n');
    
    if (rows.length === 0) {
        console.log('⚠️  NO USERS FOUND! You need to run admin-setup.js first.');
    } else {
        rows.forEach((row) => {
            console.log(`Username: "${row.username}"`);
            console.log(`Email: ${row.email}`);
            console.log(`Role: ${row.role}`);
            console.log('---');
        });
    }

    db.close();
});

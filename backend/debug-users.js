const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, '../database/store.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Connected to the database.');

    // Query all users to see what's actually in the database
    db.all('SELECT id, username, email, role, password_hash FROM users', [], (err, rows) => {
        if (err) {
            console.error('Error querying users:', err.message);
            return;
        }

        if (rows.length === 0) {
            console.log('No users found in the database.');
        } else {
            console.log('Users in the database:');
            rows.forEach(row => {
                console.log(`ID: ${row.id}`);
                console.log(`  Username: ${row.username}`);
                console.log(`  Email: ${row.email}`);
                console.log(`  Role: ${row.role}`);
                console.log(`  Password Hash (first 30 chars): ${row.password_hash ? row.password_hash.substring(0, 30) + '...' : 'NULL'}`);
                console.log('  ---');
            });
        }

        // Close the database connection
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    });
});
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
    
    // Query all users to verify the admin account
    db.all('SELECT id, username, email, role FROM users', [], (err, rows) => {
        if (err) {
            console.error('Error querying users:', err.message);
            return;
        }
        
        if (rows.length === 0) {
            console.log('No users found in the database.');
        } else {
            console.log('Users in the database:');
            rows.forEach(row => {
                console.log(`ID: ${row.id}, Username: ${row.username}, Email: ${row.email}, Role: ${row.role}`);
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
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, '../database/store.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Connected to the database.');
    
    // Get the admin user to verify the stored password hash
    db.get('SELECT id, username, password_hash FROM users WHERE username = ?', ['MUHAMMAD SHAYAN'], (err, row) => {
        if (err) {
            console.error('Error querying admin user:', err.message);
            return;
        }
        
        if (!row) {
            console.log('Admin user not found.');
            return;
        }
        
        console.log('Admin user found. Verifying password...');
        console.log('Username:', row.username);
        console.log('Stored hash:', row.password_hash.substring(0, 20) + '...'); // Only showing first 20 chars
        
        // Verify password
        bcrypt.compare('Shayan1234$', row.password_hash, (err, result) => {
            if (err) {
                console.error('Error comparing password:', err.message);
                return;
            }
            
            if (result) {
                console.log('✅ Password verification successful! You can log in with:');
                console.log('Username: MUHAMMAD SHAYAN');
                console.log('Password: Shayan1234$');
            } else {
                console.log('❌ Password verification failed. The stored hash does not match the password "Shayan1234$".');
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
});
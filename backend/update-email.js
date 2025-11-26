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
    
    // Update the email for the admin user
    db.run('UPDATE users SET email = ? WHERE username = ?', ['shayanihtiram443@gmail.com', 'MUHAMMAD SHAYAN'], function(err) {
        if (err) {
            console.error('Error updating email:', err.message);
            return;
        }
        
        if (this.changes === 0) {
            console.log('No user found with username MUHAMMAD SHAYAN');
        } else {
            console.log('Email updated successfully for user MUHAMMAD SHAYAN');
            
            // Verify the update
            db.get('SELECT id, username, email, role FROM users WHERE username = ?', ['MUHAMMAD SHAYAN'], (err, row) => {
                if (err) {
                    console.error('Error querying user:', err.message);
                    return;
                }
                
                if (row) {
                    console.log('Updated user details:');
                    console.log(`ID: ${row.id}, Username: ${row.username}, Email: ${row.email}, Role: ${row.role}`);
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
        }
    });
});
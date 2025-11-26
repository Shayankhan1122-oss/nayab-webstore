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
    
    // Check if admin already exists
    db.get('SELECT * FROM users WHERE role = "admin"', [], (err, row) => {
        if (err) {
            console.error('Error checking for existing admin:', err.message);
            return;
        }
        
        if (row) {
            console.log('An admin account already exists. Skipping admin creation.');
            process.exit(0);
        }
        
        // Hash the password
        bcrypt.hash('Shayan1234$', 10)
            .then(hashedPassword => {
                // Insert the new admin user
                const insertQuery = 'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, "admin")';
                
                db.run(insertQuery, ['MUHAMMAD SHAYAN', 'shayan@example.com', hashedPassword], function(err) {
                    if (err) {
                        console.error('Error creating admin account:', err.message);
                        return;
                    }
                    
                    console.log('Admin account created successfully!');
                    console.log('Username: MUHAMMAD SHAYAN');
                    console.log('Password: Shayan1234$');
                    console.log('Admin registration has been disabled for security.');
                    
                    // Close the database connection
                    db.close((err) => {
                        if (err) {
                            console.error('Error closing database:', err.message);
                        } else {
                            console.log('Database connection closed.');
                        }
                    });
                });
            })
            .catch(err => {
                console.error('Error hashing password:', err.message);
            });
    });
});
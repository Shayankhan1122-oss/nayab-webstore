const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Create or connect to the database
const dbPath = path.join(__dirname, '../database/store.db');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    
    console.log('Connected to the SQLite database.');
    
    // Create tables
    createTables();
});

function createTables() {
    // Create users table first
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    db.run(createUsersTable, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
            return;
        }
        
        console.log('Users table created or already exists.');
        
        // Now insert the admin user
        insertAdminUser();
    });
}

function insertAdminUser() {
    // Hash the password
    bcrypt.hash('Shayan1234$', 10)
        .then(hashedPassword => {
            // Insert the admin user (using INSERT OR IGNORE to avoid duplicates)
            const insertQuery = 'INSERT OR IGNORE INTO users (username, email, password_hash, role) VALUES (?, ?, ?, "admin")';
            
            db.run(insertQuery, ['MUHAMMAD SHAYAN', 'shayanihtiram443@gmail.com', hashedPassword], function(err) {
                if (err) {
                    console.error('Error inserting admin user:', err.message);
                } else {
                    if (this.changes > 0) {
                        console.log('Admin user created successfully!');
                    } else {
                        console.log('Admin user already exists.');
                    }
                }
                
                // Close the database connection
                db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err.message);
                    } else {
                        console.log('Database connection closed successfully.');
                        console.log('Now run: node server.js');
                    }
                });
            });
        })
        .catch(err => {
            console.error('Error hashing password:', err.message);
            db.close();
        });
}
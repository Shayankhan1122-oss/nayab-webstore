const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/store.db');
console.log('Using database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error connecting to database:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to database');
});

// First, check if admin exists
db.get('SELECT * FROM users WHERE role = "admin"', [], (err, row) => {
    if (err) {
        console.error('❌ Error checking for admin:', err.message);
        db.close();
        return;
    }

    if (row) {
        console.log('⚠️  Admin already exists:', row.username);
        console.log('Deleting old admin and creating new one...');
        
        // Delete existing admin
        db.run('DELETE FROM users WHERE role = "admin"', [], (err) => {
            if (err) {
                console.error('❌ Error deleting old admin:', err.message);
                db.close();
                return;
            }
            createAdmin();
        });
    } else {
        console.log('No admin found. Creating new admin...');
        createAdmin();
    }
});

function createAdmin() {
    const username = 'MUHAMMAD SHAYAN';
    const email = 'shayan@example.com';
    const password = 'Shayan1234$';

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('❌ Error hashing password:', err.message);
            db.close();
            return;
        }

        // Insert admin user
        const sql = 'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)';
        
        db.run(sql, [username, email, hashedPassword, 'admin'], function(err) {
            if (err) {
                console.error('❌ Error creating admin:', err.message);
            } else {
                console.log('\n🎉 Admin account created successfully!');
                console.log('═══════════════════════════════════');
                console.log('Username:', username);
                console.log('Password:', password);
                console.log('Email:', email);
                console.log('═══════════════════════════════════');
                console.log('\nYou can now login at: http://localhost:5000/admin/admin-login.html');
            }
            
            db.close(() => {
                console.log('\n✅ Database connection closed');
            });
        });
    });
}
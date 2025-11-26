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
    console.log('Connected to the database for login simulation.');

    const testUsername = 'MUHAMMAD SHAYAN';
    const testPassword = 'Shayan1234$';
    
    console.log(`\nTesting login for user: ${testUsername} with password: ${testPassword}`);
    
    // Simulate the login process
    const query = 'SELECT * FROM users WHERE username = ?';
    
    db.get(query, [testUsername], async (err, user) => {
        if (err) {
            console.error('Database error:', err.message);
            return;
        }

        if (!user) {
            console.log('❌ User not found in database');
            db.close();
            return;
        }

        console.log(`✅ User found: ${user.username}`);
        console.log(`Role: ${user.role}`);
        console.log(`Password hash in DB: ${user.password_hash.substring(0, 30)}...`);

        // Compare password with hashed password
        const isPasswordValid = await bcrypt.compare(testPassword, user.password_hash);

        if (!isPasswordValid) {
            console.log('❌ Password comparison failed - stored hash does not match provided password');
            console.log('This means the password you entered is not correct for this user');
        } else {
            console.log('✅ Password verification successful!');
        }

        // Let's also try a few possible variations of the password
        const possiblePasswords = [
            'Shayan1234$', 
            'shayan1234$', 
            'SHAYAN1234$',
            'muhammad shayan',
            'MUHAMMAD SHAYAN'
        ];
        
        console.log('\nTrying common variations to see if any match...');
        for (const pwd of possiblePasswords) {
            const result = await bcrypt.compare(pwd, user.password_hash);
            console.log(`${pwd}: ${result ? '✅ MATCH' : '❌ no match'}`);
        }

        // Close the database connection
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('\nDatabase connection closed.');
            }
        });
    });
});
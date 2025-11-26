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
    console.log('Connected to the database for comprehensive login check.');

    // Check all users
    db.all('SELECT id, username, email, role FROM users', [], (err, rows) => {
        if (err) {
            console.error('Error querying users:', err.message);
            return;
        }

        console.log(`Found ${rows.length} user(s) in database:`);
        rows.forEach(row => {
            console.log(`- ID: ${row.id}, Username: "${row.username}", Email: "${row.email}", Role: "${row.role}"`);
        });

        // Test with the specific admin user
        const testUsername = 'MUHAMMAD SHAYAN';
        
        // First, verify the user exists
        db.get('SELECT * FROM users WHERE username = ?', [testUsername], async (err, user) => {
            if (err) {
                console.error('Database error when finding user:', err.message);
                db.close();
                return;
            }

            if (!user) {
                console.log(`❌ User "${testUsername}" not found in database`);
                // Maybe there's a whitespace issue or case difference
                db.get('SELECT * FROM users WHERE TRIM(LOWER(username)) = TRIM(LOWER(?))', [testUsername], (err, user2) => {
                    if (user2) {
                        console.log(`Found user with similar name: "${user2.username}" - this might be a whitespace/case issue`);
                    }
                    db.close();
                });
                return;
            }

            console.log(`✅ User found: "${user.username}"`);
            console.log(`Role: ${user.role}`);
            
            // Now test various possible passwords
            const possiblePasswords = [
                'Shayan1234$',
                ' Shayan1234$', // with leading space
                'Shayan1234$ ', // with trailing space
                'shayan1234$',
                'SHAYAN1234$',
                'Muhammad Shayan', // maybe password is same as username
                'MUHAMMAD SHAYAN'
            ];
            
            console.log('\nTesting various password possibilities:');
            for (const pwd of possiblePasswords) {
                const isValid = await bcrypt.compare(pwd, user.password_hash);
                console.log(`Password "${pwd}": ${isValid ? '✅ MATCH' : '❌ no match'}`);
            }
            
            // Check exact password from setup script
            const exactSetupPassword = 'Shayan1234$';
            const exactCheck = await bcrypt.compare(exactSetupPassword, user.password_hash);
            console.log(`\nExact setup password "${exactSetupPassword}": ${exactCheck ? '✅ CORRECT' : '❌ incorrect'}`);
            
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                } else {
                    console.log('\nDatabase connection closed.');
                }
            });
        });
    });
});
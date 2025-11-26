const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/store.db');
console.log('Opening database at:', dbPath);

try {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Successfully connected to database');
            
            // Test a simple query
            db.get('SELECT 1 as test', (err, row) => {
                if (err) {
                    console.error('Error running query:', err.message);
                } else {
                    console.log('Query successful:', row);
                }
                
                db.close((closeErr) => {
                    if (closeErr) {
                        console.error('Error closing database:', closeErr.message);
                    } else {
                        console.log('Database closed successfully');
                    }
                });
            });
        }
    });
} catch (error) {
    console.error('Exception when creating database connection:', error.message);
}
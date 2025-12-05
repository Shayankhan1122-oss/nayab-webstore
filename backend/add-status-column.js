const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/store.db');

console.log('Opening database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('✅ Connected to database');
});

// Add status column
console.log('Adding status column to orders table...');

db.run('ALTER TABLE orders ADD COLUMN status TEXT DEFAULT "pending"', (err) => {
    if (err) {
        if (err.message.includes('duplicate column')) {
            console.log('✅ Status column already exists');
        } else {
            console.error('❌ Error adding status column:', err.message);
        }
    } else {
        console.log('✅ Status column added successfully!');
    }
    
    // Verify the change
    db.all("PRAGMA table_info(orders)", [], (err, columns) => {
        if (err) {
            console.error('Error checking columns:', err.message);
        } else {
            console.log('\n📋 Orders table columns:');
            columns.forEach(col => {
                console.log(`  - ${col.name} (${col.type})`);
            });
        }
        
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('\n✅ Database connection closed');
                console.log('Migration complete!');
            }
        });
    });
});
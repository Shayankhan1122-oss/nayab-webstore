const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/store.db');
console.log('📂 Database path:', dbPath);

const db = new sqlite3.Database(dbPath);

console.log('📦 Adding stock column to products table...');

db.run('ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0', (err) => {
    if (err) {
        if (err.message.includes('duplicate column')) {
            console.log('✅ Stock column already exists');
        } else {
            console.error('❌ Error:', err.message);
        }
    } else {
        console.log('✅ Stock column added successfully!');
    }
    
    // Show table structure
    db.all("PRAGMA table_info(products)", (err, columns) => {
        if (!err) {
            console.log('\n📋 Products table columns:');
            columns.forEach(col => {
                console.log(`  - ${col.name} (${col.type})`);
            });
        }
        
        db.close(() => {
            console.log('\n✅ Database connection closed');
            console.log('Migration complete!');
        });
    });
});
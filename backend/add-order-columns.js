const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/store.db');
const db = new sqlite3.Database(dbPath);

console.log('Adding missing columns to orders table...');

db.serialize(() => {
    db.run('ALTER TABLE orders ADD COLUMN subtotal REAL DEFAULT 0', (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding subtotal:', err.message);
        } else {
            console.log('✅ Subtotal column ready');
        }
    });

    db.run('ALTER TABLE orders ADD COLUMN delivery_charges REAL DEFAULT 0', (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding delivery_charges:', err.message);
        } else {
            console.log('✅ Delivery_charges column ready');
        }
    });

    db.run('ALTER TABLE orders ADD COLUMN order_notes TEXT DEFAULT ""', (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding order_notes:', err.message);
        } else {
            console.log('✅ Order_notes column ready');
        }
        
        db.close(() => {
            console.log('\n✅ Migration complete!');
        });
    });
});
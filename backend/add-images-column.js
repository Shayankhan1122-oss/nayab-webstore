const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/store.db');
console.log('📂 Database path:', dbPath);
const db = new sqlite3.Database(dbPath);

console.log('📦 Adding images column to products table...');

db.run('ALTER TABLE products ADD COLUMN images TEXT', (err) => {
    if (err) {
        if (err.message.includes('duplicate column')) {
            console.log('✅ Images column already exists');
        } else {
            console.error('❌ Error:', err.message);
        }
    } else {
        console.log('✅ Images column added successfully!');
        
        // Migrate existing data - copy image_url to images array
        db.all('SELECT id, image_url FROM products WHERE images IS NULL', (err, rows) => {
            if (err) {
                console.error('Error reading products:', err);
                db.close();
                return;
            }
            
            console.log(`📝 Migrating ${rows.length} products...`);
            
            rows.forEach(row => {
                const imagesJson = JSON.stringify([row.image_url]);
                db.run('UPDATE products SET images = ? WHERE id = ?', [imagesJson, row.id], (err) => {
                    if (err) {
                        console.error(`Error updating product ${row.id}:`, err);
                    }
                });
            });
            
            setTimeout(() => {
                console.log('✅ Migration complete!');
                db.close();
            }, 1000);
        });
    }
    
    if (err && err.message.includes('duplicate column')) {
        db.close();
    }
});
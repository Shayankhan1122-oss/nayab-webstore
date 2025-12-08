require('dotenv').config();

// Force check JWT_SECRET
console.log('🔑 JWT_SECRET is set:', !!process.env.JWT_SECRET);
if (process.env.JWT_SECRET) {
    console.log('✅ JWT_SECRET loaded successfully');
} else {
    console.log('⚠️  WARNING: JWT_SECRET not found! Using fallback key');
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/uploads');

// ADD DATABASE MIGRATION HERE ↓
const { db } = require('./config/db');

// Auto-run migrations on startup
console.log('🔄 Running database migrations...');

// 1. Add status column to orders
db.run('ALTER TABLE orders ADD COLUMN status TEXT DEFAULT "pending"', (err) => {
    if (err && !err.message.includes('duplicate column')) {
        console.warn('⚠️ Status column warning:', err.message);
    } else {
        console.log('✅ Status column ready');
    }
});

// 2. Add subtotal column to orders
db.run('ALTER TABLE orders ADD COLUMN subtotal REAL DEFAULT 0', (err) => {
    if (err && !err.message.includes('duplicate column')) {
        console.warn('⚠️ Subtotal column warning:', err.message);
    } else {
        console.log('✅ Subtotal column ready');
    }
});

// 3. Add delivery_charges column to orders
db.run('ALTER TABLE orders ADD COLUMN delivery_charges REAL DEFAULT 0', (err) => {
    if (err && !err.message.includes('duplicate column')) {
        console.warn('⚠️ Delivery charges column warning:', err.message);
    } else {
        console.log('✅ Delivery charges column ready');
    }
});

// 4. Add order_notes column to orders
db.run('ALTER TABLE orders ADD COLUMN order_notes TEXT DEFAULT ""', (err) => {
    if (err && !err.message.includes('duplicate column')) {
        console.warn('⚠️ Order notes column warning:', err.message);
    } else {
        console.log('✅ Order notes column ready');
    }
});

// 5. Add images column to products for multiple images support
db.run('ALTER TABLE products ADD COLUMN images TEXT', (err) => {
    if (err) {
        if (err.message.includes('duplicate column')) {
            console.log('✅ Images column already exists');
        } else {
            console.warn('⚠️ Images column warning:', err.message);
        }
    } else {
        console.log('✅ Images column added to products table');
        
        // Migrate existing products - copy image_url to images array
        db.all('SELECT id, image_url FROM products WHERE images IS NULL', (err, rows) => {
            if (!err && rows && rows.length > 0) {
                console.log(`📝 Migrating ${rows.length} existing products to use images array...`);
                rows.forEach(row => {
                    const imagesJson = JSON.stringify([row.image_url]);
                    db.run('UPDATE products SET images = ? WHERE id = ?', [imagesJson, row.id]);
                });
                console.log('✅ Product images migration complete');
            }
        });
    }
});

// 6. Add stock column to products if missing
db.run('ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0', (err) => {
    if (err && !err.message.includes('duplicate column')) {
        console.warn('⚠️ Stock column warning:', err.message);
    } else {
        console.log('✅ Stock column ready');
    }
});

console.log('✅ All migrations complete!');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);

// Serve the frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
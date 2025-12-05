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

// Auto-run migration on startup (adds status column if missing)
db.run('ALTER TABLE orders ADD COLUMN status TEXT DEFAULT "pending"', (err) => {
    if (err) {
        if (err.message.includes('duplicate column')) {
            console.log('✅ Status column already exists');
        } else {
            console.warn('⚠️ Migration warning:', err.message);
        }
    } else {
        console.log('✅ Status column added to orders table');
    }
});
// MIGRATION CODE ENDS HERE ↑

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
    console.log(`Server is running on port ${PORT}`);
});
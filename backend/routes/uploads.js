const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const type = req.body.type || 'product';
        const uploadPath = type === 'category' 
            ? path.join(__dirname, '../uploads/categories')
            : path.join(__dirname, '../uploads/products');
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Upload product image (admin only)
router.post('/product', authenticateToken, authorizeAdmin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const imageUrl = `/uploads/products/${req.file.filename}`;
        res.json({ 
            message: 'Image uploaded successfully',
            imageUrl: imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Upload category logo (admin only)
router.post('/category', authenticateToken, authorizeAdmin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const imageUrl = `/uploads/categories/${req.file.filename}`;
        const categoryId = req.body.categoryId;

        res.json({ 
            message: 'Category logo uploaded successfully',
            imageUrl: imageUrl,
            filename: req.file.filename,
            categoryId: categoryId
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
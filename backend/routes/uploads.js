const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const type = req.body.type || 'product';
        const uploadPath = type === 'category' 
            ? path.join(__dirname, '../uploads/categories')
            : path.join(__dirname, '../uploads/products');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
            console.log('✅ Created directory:', uploadPath);
        }
        
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
            console.log('❌ No file uploaded');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const imageUrl = `/uploads/products/${req.file.filename}`;
        console.log('✅ Image uploaded successfully:', imageUrl);
        console.log('   File path:', req.file.path);
        console.log('   File size:', req.file.size, 'bytes');
        
        res.json({ 
            message: 'Image uploaded successfully',
            imageUrl: imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('❌ Upload error:', error);
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

        console.log('✅ Category logo uploaded:', imageUrl);

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

// DEBUG ROUTE - Check uploaded files (remove after debugging)
router.get('/check-uploads', (req, res) => {
    const productsPath = path.join(__dirname, '../uploads/products');
    const categoriesPath = path.join(__dirname, '../uploads/categories');
    
    const checkDir = (dirPath) => {
        if (!fs.existsSync(dirPath)) {
            return { exists: false, path: dirPath };
        }
        const files = fs.readdirSync(dirPath);
        return { 
            exists: true, 
            path: dirPath,
            files: files,
            count: files.length 
        };
    };

    res.json({
        products: checkDir(productsPath),
        categories: checkDir(categoriesPath),
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
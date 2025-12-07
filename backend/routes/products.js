const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// Get all products
router.get('/', (req, res) => {
    db.all('SELECT * FROM products', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Parse images JSON for each product
        const products = rows.map(row => {
            let images = [];
            try {
                images = row.images ? JSON.parse(row.images) : [row.image_url];
            } catch (e) {
                images = [row.image_url];
            }
            
            return {
                ...row,
                images: images
            };
        });
        
        res.json({ products });
    });
});

// Get a specific product by ID
router.get('/:id', (req, res) => {
    const id = req.params.id;

    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        
        // Parse images JSON
        let images = [];
        try {
            images = row.images ? JSON.parse(row.images) : [row.image_url];
        } catch (e) {
            images = [row.image_url];
        }
        
        res.json({ 
            product: {
                ...row,
                images: images
            }
        });
    });
});

// Add a new product (admin only)
router.post('/', authenticateToken, authorizeAdmin, (req, res) => {
    const { name, price, category, description, stock, image_url, images } = req.body;

    if (!name || !price || !category || !description || stock === undefined || !image_url) {
        return res.status(400).json({ error: 'All product details are required' });
    }

    // Convert images array to JSON string
    const imagesJson = images ? JSON.stringify(images) : JSON.stringify([image_url]);

    const query = 'INSERT INTO products (name, price, category, description, stock, image_url, images) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const params = [name, price, category, description, stock, image_url, imagesJson];

    db.run(query, params, function(err) {
        if (err) {
            // If images column doesn't exist, try without it
            if (err.message.includes('no column named images')) {
                const fallbackQuery = 'INSERT INTO products (name, price, category, description, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)';
                const fallbackParams = [name, price, category, description, stock, image_url];
                
                db.run(fallbackQuery, fallbackParams, function(fallbackErr) {
                    if (fallbackErr) {
                        return res.status(500).json({ error: fallbackErr.message });
                    }
                    res.status(201).json({ 
                        id: this.lastID, 
                        message: 'Product added successfully (without multiple images support)' 
                    });
                });
                return;
            }
            
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID, message: 'Product added successfully' });
    });
});

// Update a product (admin only)
router.put('/:id', authenticateToken, authorizeAdmin, (req, res) => {
    const id = req.params.id;
    const { name, price, category, description, stock, image_url, images } = req.body;

    if (!name || !price || !category || !description || stock === undefined) {
        return res.status(400).json({ error: 'All product details are required' });
    }

    // Convert images array to JSON string
    const imagesJson = images ? JSON.stringify(images) : null;

    let query, params;
    
    if (imagesJson) {
        query = 'UPDATE products SET name = ?, price = ?, category = ?, description = ?, stock = ?, image_url = ?, images = ? WHERE id = ?';
        params = [name, price, category, description, stock, image_url, imagesJson, id];
    } else {
        query = 'UPDATE products SET name = ?, price = ?, category = ?, description = ?, stock = ?, image_url = ? WHERE id = ?';
        params = [name, price, category, description, stock, image_url, id];
    }

    db.run(query, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product updated successfully' });
    });
});

// Delete a product (admin only)
router.delete('/:id', authenticateToken, authorizeAdmin, (req, res) => {
    const id = req.params.id;

    db.run('DELETE FROM products WHERE id = ?', id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    });
});

module.exports = router;
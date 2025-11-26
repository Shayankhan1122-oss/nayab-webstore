const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// Get all products
router.get('/', (req, res) => {
    const category = req.query.category;
    let query = 'SELECT * FROM products';
    let params = [];

    if (category) {
        query += ' WHERE category = ?';
        params = [category];
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ products: rows });
    });
});

// Get a specific product
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
        res.json({ product: row });
    });
});

// Add a new product (admin only)
router.post('/', authenticateToken, authorizeAdmin, (req, res) => {
    const { name, description, price, category, image_url, stock_quantity } = req.body;

    if (!name || !price || !category) {
        return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    const query = 'INSERT INTO products (name, description, price, category, image_url, stock_quantity) VALUES (?, ?, ?, ?, ?, ?)';
    const params = [name, description, price, category, image_url, stock_quantity || 0];

    db.run(query, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID, message: 'Product added successfully' });
    });
});

// Update a product (admin only)
router.put('/:id', authenticateToken, authorizeAdmin, (req, res) => {
    const id = req.params.id;
    const { name, description, price, category, image_url, stock_quantity } = req.body;

    const query = 'UPDATE products SET name = ?, description = ?, price = ?, category = ?, image_url = ?, stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const params = [name, description, price, category, image_url, stock_quantity, id];

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
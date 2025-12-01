const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// Place a new order
router.post('/', (req, res) => {
    const { 
        customer_name, 
        customer_email, 
        customer_phone, 
        shipping_address, 
        order_notes,
        items,
        subtotal,
        delivery_charges,
        total_amount 
    } = req.body;

    console.log('📦 Order received:', req.body);

    if (!customer_name || !customer_email || !customer_phone || !shipping_address || !items || !total_amount) {
        console.log('❌ Missing required fields');
        return res.status(400).json({ error: 'All order details are required' });
    }

    // Convert items to JSON string
    const orderItemsJson = JSON.stringify(items);

    const query = `INSERT INTO orders 
        (customer_name, customer_email, customer_phone, shipping_address, order_items, total_amount, order_notes, subtotal, delivery_charges) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const params = [
        customer_name, 
        customer_email, 
        customer_phone, 
        shipping_address, 
        orderItemsJson, 
        total_amount,
        order_notes || '',
        subtotal || 0,
        delivery_charges || 0
    ];

    db.run(query, params, function(err) {
        if (err) {
            console.error('❌ Database error:', err.message);
            
            // Check if columns are missing
            if (err.message.includes('no column')) {
                console.log('⚠️ Database schema needs updating. Trying basic insert...');
                
                // Fallback to basic insert without new columns
                const basicQuery = 'INSERT INTO orders (customer_name, customer_email, customer_phone, shipping_address, order_items, total_amount) VALUES (?, ?, ?, ?, ?, ?)';
                const basicParams = [customer_name, customer_email, customer_phone, shipping_address, orderItemsJson, total_amount];
                
                db.run(basicQuery, basicParams, function(fallbackErr) {
                    if (fallbackErr) {
                        return res.status(500).json({ error: fallbackErr.message });
                    }
                    console.log('✅ Order created with basic schema');
                    res.status(201).json({ id: this.lastID, message: 'Order placed successfully' });
                });
            } else {
                res.status(500).json({ error: err.message });
            }
            return;
        }
        console.log('✅ Order created successfully:', this.lastID);
        res.status(201).json({ id: this.lastID, message: 'Order placed successfully' });
    });
});

// Get all orders (admin only)
router.get('/', authenticateToken, authorizeAdmin, (req, res) => {
    db.all('SELECT * FROM orders ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // Parse order_items JSON
        const orders = rows.map(row => {
            return {
                ...row,
                order_items: JSON.parse(row.order_items)
            };
        });
        res.json({ orders });
    });
});

// Get a specific order (admin only)
router.get('/:id', authenticateToken, authorizeAdmin, (req, res) => {
    const id = req.params.id;

    db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        res.json({ order: { ...row, order_items: JSON.parse(row.order_items) } });
    });
});

// Update order status (admin only)
router.put('/:id', authenticateToken, authorizeAdmin, (req, res) => {
    const id = req.params.id;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    const query = 'UPDATE orders SET status = ? WHERE id = ?';
    const params = [status, id];

    db.run(query, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ message: 'Order status updated successfully' });
    });
});

// Delete an order (admin only)
router.delete('/:id', authenticateToken, authorizeAdmin, (req, res) => {
    const id = req.params.id;

    db.run('DELETE FROM orders WHERE id = ?', id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    });
});

module.exports = router;
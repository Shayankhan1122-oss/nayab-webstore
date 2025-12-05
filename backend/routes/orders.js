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

    const validStatuses = ['pending','confirmed','processing', 'shipped', 'delivered', 'cancelled'];
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

// Send order confirmation email
router.post('/:id/confirm-email', authenticateToken, authorizeAdmin, (req, res) => {
    const orderId = req.params.id;
    const { customerEmail, customerName } = req.body;

    // Get order details
    db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, order) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Parse order items
        const orderItems = JSON.parse(order.order_items);

        // Create order tracking URL
        const trackingUrl = `${process.env.APP_URL || 'https://nayab-webstore-production.up.railway.app'}/pages/track-order.html?id=${orderId}&email=${encodeURIComponent(customerEmail)}`;

        // Email content (you'll need to set up email service like SendGrid, Mailgun, or NodeMailer)
        const emailContent = {
            to: customerEmail,
            subject: `Order Confirmed #${orderId} - BLOOME BY NAYAB`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #28a745;">✓ Order Confirmed!</h2>
                    <p>Dear ${customerName},</p>
                    <p>Thank you for your order! Your order #${orderId} has been confirmed and will be processed shortly.</p>
                    
                    <h3>Order Details:</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f5f5f5;">
                                <th style="padding: 10px; text-align: left;">Product</th>
                                <th style="padding: 10px; text-align: center;">Qty</th>
                                <th style="padding: 10px; text-align: right;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orderItems.map(item => `
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">${item.quantity}</td>
                                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">Rs ${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <p style="margin-top: 20px;"><strong>Delivery Charges:</strong> Rs ${order.delivery_charges || 0}</p>
                    <h3 style="color: #28a745;">Total: Rs ${order.total_amount}</h3>
                    
                    <p><strong>Shipping Address:</strong><br>${order.shipping_address}</p>
                    
                    <div style="margin: 30px 0;">
                        <a href="${trackingUrl}" 
                           style="display: inline-block; padding: 15px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                            Track Your Order
                        </a>
                    </div>
                    
                    <p>If you have any questions, please contact us.</p>
                    <p>Thank you for shopping with BLOOME BY NAYAB!</p>
                    
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">© 2025 BLOOME BY NAYAB. All rights reserved.</p>
                </div>
            `
        };

        // For now, just log the email content (you'll need to integrate an email service)
        console.log('📧 Email to send:', emailContent);
        console.log('📦 Tracking URL:', trackingUrl);

        // TODO: Integrate with email service
        // Example with nodemailer or SendGrid would go here

        res.json({ 
            message: 'Confirmation email sent',
            trackingUrl: trackingUrl,
            note: 'Email service not configured yet - check server logs for email content'
        });
    });
});

module.exports = router;
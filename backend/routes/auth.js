const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');

// Admin login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    console.log('Login attempt received for username:', username); // Debug logging

    if (!username || !password) {
        console.log('Missing username or password');
        return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user in database
    const query = 'SELECT * FROM users WHERE username = ?';

    db.get(query, [username], async (err, user) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (!user) {
            console.log('User not found in database:', username);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('User found:', user.username, 'Role:', user.role); // Debug logging

        // Compare password with hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            console.log('Password validation failed for user:', username);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if user has admin role
        if (user.role !== 'admin') {
            console.log('User does not have admin role:', user.role);
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }

        console.log('Login successful for user:', username); // Debug logging

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    });
});

// Register admin - Only accessible via direct server setup (not through frontend)
router.post('/register', async (req, res) => {
    const adminSecret = process.env.ADMIN_SETUP_SECRET;

    if (!adminSecret) {
        return res.status(500).json({ error: 'Admin setup secret is not configured' });
    }

    const providedSecret = req.headers['admin-setup-secret'];

    if (providedSecret !== adminSecret) {
        return res.status(403).json({ error: 'Admin registration is restricted' });
    }

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if any admin already exists
    db.get('SELECT * FROM users WHERE role = "admin"', [], (err, row) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (row) {
            return res.status(400).json({ error: 'An admin account already exists. Registration is not allowed.' });
        }

        // Hash the password
        bcrypt.hash(password, 10)
            .then(hashedPassword => {
                // Insert new admin user
                const insertQuery = 'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, "admin")';

                db.run(insertQuery, [username, email, hashedPassword], function(err) {
                    if (err) {
                        console.error('Database error:', err.message);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }

                    res.status(201).json({
                        message: 'Admin account created successfully',
                        user: {
                            id: this.lastID,
                            username,
                            email,
                            role: 'admin'
                        }
                    });
                });
            })
            .catch(err => {
                console.error('Error hashing password:', err.message);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    });
});

module.exports = router;
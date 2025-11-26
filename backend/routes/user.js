const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { db } = require('../config/db');

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const query = 'SELECT id, username, role FROM users WHERE id = ?';

    db.get(query, [userId], (err, user) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    });
});

module.exports = router;

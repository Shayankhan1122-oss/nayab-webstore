const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        console.log('❌ No token provided');
        return res.status(401).json({ error: 'Access token required' });
    }

    console.log('🔐 Verifying token...');
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key', (err, user) => {
        if (err) {
            console.log('❌ Token verification failed:', err.message);
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        console.log('✅ Token verified for user:', user.username, 'Role:', user.role);
        req.user = user;
        next();
    });
};

const authorizeAdmin = (req, res, next) => {
    console.log('Checking admin authorization for user:', req.user);
    if (req.user && req.user.role === 'admin') {
        console.log('✅ Admin access granted');
        next();
    } else {
        console.log('❌ Admin access denied. User role:', req.user?.role);
        return res.status(403).json({ error: 'Admin access required' });
    }
};

module.exports = {
    authenticateToken,
    authorizeAdmin
};
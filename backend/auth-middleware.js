const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    if (!process.env.JWT_SECRET) {
        console.error('[SECURITY ALERT] JWT_SECRET is not configured in environment variables.');
        return res.status(500).json({ success: false, message: 'Server authentication configuration error.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (ex) {
        if (ex.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token has expired. Please log in again.' });
        }
        return res.status(401).json({ success: false, message: 'Invalid or malformed authentication token.' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
    }
};

const customerAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. Customer authentication required.' });
    }

    if (!process.env.JWT_SECRET) {
        console.error('[SECURITY ALERT] JWT_SECRET is not configured in environment variables.');
        return res.status(500).json({ success: false, message: 'Server authentication configuration error.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (ex) {
        if (ex.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
        }
        return res.status(401).json({ success: false, message: 'Invalid customer token.' });
    }
};

const adminAuth = [authMiddleware, isAdmin];

module.exports = { authMiddleware, isAdmin, adminAuth, customerAuth };


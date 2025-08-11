const jwt = require('jsonwebtoken');

// JWT secret key - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Generate JWT token
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

// Extract token from Authorization header
const extractToken = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7); // Remove 'Bearer ' prefix
};

// Authentication middleware
const authenticateToken = async (req) => {
    const token = extractToken(req);

    if (!token) {
        throw new Error('Access token required');
    }

    try {
        const decoded = verifyToken(token);
        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

// GraphQL context middleware
const createAuthContext = async (req) => {
    try {
        const user = await authenticateToken(req);
        return { req, user, isAuthenticated: true };
    } catch (error) {
        return { req, user: null, isAuthenticated: false, authError: error.message };
    }
};

module.exports = {
    generateToken,
    verifyToken,
    authenticateToken,
    createAuthContext,
    JWT_SECRET
}; 
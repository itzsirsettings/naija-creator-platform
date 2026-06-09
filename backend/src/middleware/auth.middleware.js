const jwt = require('jsonwebtoken');
const env = require('../config/env');
const prisma = require('../lib/prisma');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorized: no token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);

    if (decoded.type && decoded.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, suspendedAt: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Not authorized: user not found' });
    }

    if (user.suspendedAt) {
      return res.status(403).json({ error: 'Account suspended. Contact support.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Refresh your session or log in again.' });
    }
    return res.status(401).json({ error: 'Not authorized: invalid token' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: `Access denied: requires role ${roles.join(' or ')}` });
  }
  next();
};

module.exports = { protect, requireRole };

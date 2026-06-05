const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const employeeOrAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'employee') {
    return res.status(403).json({ message: 'Employee or Admin access required' });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminOnly,
  employeeOrAdmin
};

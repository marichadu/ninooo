const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'real-estate-platform-dev-secret');

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production');
}

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const verifyPassword = (plainPassword, hashedPassword) => {
  if (!plainPassword || !hashedPassword) {
    return false;
  }

  // Prefer bcrypt verification for real hashed passwords.
  try {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  } catch (error) {
    return false;
  }
};

module.exports = {
  generateToken,
  verifyPassword
};

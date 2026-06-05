'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { generateToken, verifyPassword } = require('../utils/auth');
const db = require('../database');

const router = express.Router();

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email=?').get(String(email || '').trim().toLowerCase());

  if (!user || !verifyPassword(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.json({
    token: generateToken(user),
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

// Get profile
router.get('/profile', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

// Logout (JWT is stateless; client discards token)
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Create employee (Admin only)
router.post('/employees', authMiddleware, adminOnly, (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  if (db.prepare('SELECT id FROM users WHERE email=?').get(normalizedEmail)) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  if (String(password).length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const employee = {
    id:        uuidv4(),
    email:     normalizedEmail,
    password:  bcrypt.hashSync(String(password), 10),
    role:      'employee',
    name:      String(name).trim(),
    managerId: req.user.id,
  };

  db.prepare(`
    INSERT INTO users (id, email, password, role, name, managerId)
    VALUES (@id, @email, @password, @role, @name, @managerId)
  `).run(employee);

  res.status(201).json({
    id: employee.id, email: employee.email,
    role: employee.role, name: employee.name, managerId: employee.managerId,
  });
});

// List employees (Admin only)
router.get('/employees', authMiddleware, adminOnly, (req, res) => {
  const employees = db.prepare("SELECT id, email, role, name, managerId FROM users WHERE role='employee'").all();
  res.json(employees);
});

// Delete employee (Admin only)
router.delete('/employees/:id', authMiddleware, adminOnly, (req, res) => {
  const info = db.prepare("DELETE FROM users WHERE id=? AND role='employee'").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ message: 'Employee not found' });
  res.json({ message: 'Employee deleted successfully' });
});

module.exports = router;

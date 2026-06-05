'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, employeeOrAdmin } = require('../middleware/auth');
const db = require('../database');
const { notifyAdmin, confirmToSender } = require('../utils/mailer');

const router = express.Router();

// Public: submit contact message
router.post('/', (req, res) => {
  const { name, email, subject, message, propertyId, propertyTitle } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const msg = {
    id:            uuidv4(),
    name,
    email,
    subject:       subject       || '',
    message,
    propertyId:    propertyId    || null,
    propertyTitle: propertyTitle || null,
    status:        'new',
    createdAt:     new Date().toISOString(),
  };

  db.prepare(`
    INSERT INTO contacts (id, name, email, subject, message, propertyId, propertyTitle, status, createdAt)
    VALUES (@id, @name, @email, @subject, @message, @propertyId, @propertyTitle, @status, @createdAt)
  `).run(msg);

  // Send emails in background — don't block the response
  Promise.all([
    notifyAdmin({ name, email, subject, message, propertyTitle }),
    confirmToSender({ name, email }),
  ]).catch(err => console.error('Email error:', err.message));

  res.status(201).json({ message: 'Message received', id: msg.id });
});

// Employee/Admin: list messages (newest first)
router.get('/', authMiddleware, employeeOrAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM contacts ORDER BY createdAt DESC').all());
});

// Employee/Admin: update inquiry status
router.patch('/:id/status', authMiddleware, employeeOrAdmin, (req, res) => {
  const { status } = req.body;
  const allowed = ['new', 'in_progress', 'resolved'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  const updatedAt = new Date().toISOString();
  const info = db.prepare('UPDATE contacts SET status=?, updatedAt=? WHERE id=?').run(status, updatedAt, req.params.id);

  if (info.changes === 0) return res.status(404).json({ message: 'Inquiry not found' });
  res.json({ id: req.params.id, status, updatedAt });
});

module.exports = router;

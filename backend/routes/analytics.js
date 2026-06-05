'use strict';

const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const db = require('../database');

const router = express.Router();

function buildTransactions() {
  const tx = [];
  db.prepare("SELECT * FROM properties WHERE status IN ('sold','rented')").all().forEach(p => {
    if (p.status === 'sold' && p.soldBy) {
      tx.push({ id: p.id, propertyTitle: p.titleEn || p.title, type: 'sale',
        userId: p.soldBy, price: Number(p.price), date: p.soldAt || p.updatedAt || p.createdAt });
    }
    if (p.status === 'rented' && p.rentedBy) {
      tx.push({ id: p.id, propertyTitle: p.titleEn || p.title, type: 'rent',
        userId: p.rentedBy, price: Number(p.price), date: p.rentedAt || p.updatedAt || p.createdAt });
    }
  });
  return tx;
}

// GET /api/analytics/transactions
router.get('/transactions', authMiddleware, (req, res) => {
  res.json(buildTransactions());
});

// GET /api/analytics/summary
router.get('/summary', authMiddleware, (req, res) => {
  const allTx  = buildTransactions();
  const users  = db.prepare('SELECT id, name, email FROM users').all();
  const summary = {};

  users.forEach(u => { summary[u.id] = { userId: u.id, name: u.name, email: u.email, sales: 0, rentals: 0 }; });
  allTx.forEach(t => {
    if (!summary[t.userId]) return;
    if (t.type === 'sale')  summary[t.userId].sales   += 1;
    if (t.type === 'rent')  summary[t.userId].rentals += 1;
  });

  res.json(Object.values(summary));
});

module.exports = router;

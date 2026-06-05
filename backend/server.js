require('dotenv').config();
require('./database'); // initialize SQLite and seed on first run
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const analyticsRoutes = require('./routes/analytics');
const contactRoutes = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 5000;
const defaultOrigins = ['http://localhost:3000', 'http://localhost:3001'];
const configuredOrigins = (process.env.CLIENT_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
// Increase JSON body size to allow data-URL image uploads from the admin UI
app.use(express.json({ limit: '10mb' }));
// Also accept larger URL-encoded payloads if needed
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/contact', contactRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
} else {
  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
};

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  // Test credentials removed from startup logs to avoid accidental exposure
});

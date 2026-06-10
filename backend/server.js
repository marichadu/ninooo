require('dotenv').config();
require('./database'); // initialize SQLite and seed on first run
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const analyticsRoutes = require('./routes/analytics');
const contactRoutes = require('./routes/contact');
const { downloadImage, UPLOADS_DIR } = require('./utils/imageDownload');

const app = express();
const PORT = process.env.PORT || 5000;
const defaultOrigins = ['http://localhost:3000', 'http://localhost:3001'];
const configuredOrigins = (process.env.CLIENT_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];

// Middleware
app.use(compression());
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

// Serve uploaded/cached images permanently
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '365d' }));

// Image proxy — downloads external images (e.g. Facebook CDN) to local storage
// GET /api/image-proxy?url=<encoded-image-url>
app.get('/api/image-proxy', async (req, res) => {
  const { url } = req.query;
  if (!url || !url.startsWith('http')) return res.status(400).end();
  try {
    const localPath = await downloadImage(url);
    return res.redirect(301, localPath);
  } catch {
    // Could not download — redirect to fallback
    return res.redirect(302, 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=800&q=60');
  }
});

// Prevent browser from caching API responses (avoids ERR_CACHE_WRITE_FAILURE)
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
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

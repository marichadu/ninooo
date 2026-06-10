'use strict';

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const crypto = require('crypto');

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');

try {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
} catch (e) {
  console.warn('uploads dir not writable, image caching disabled:', e.message);
}

function downloadImage(sourceUrl) {
  return new Promise((resolve, reject) => {
    if (!sourceUrl || !sourceUrl.startsWith('http')) return reject(new Error('Invalid URL'));

    const hash = crypto.createHash('md5').update(sourceUrl).digest('hex');

    for (const ext of ['.jpg', '.jpeg', '.png', '.webp', '.gif']) {
      const cached = path.join(UPLOADS_DIR, `${hash}${ext}`);
      if (fs.existsSync(cached)) return resolve(`/uploads/${hash}${ext}`);
    }

    function fetch(url, hops) {
      if (hops > 5) return reject(new Error('Too many redirects'));

      const mod = url.startsWith('https') ? https : http;
      const req = mod.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 15000,
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          const next = res.headers.location.startsWith('http')
            ? res.headers.location
            : new URL(res.headers.location, url).href;
          return fetch(next, hops + 1);
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }

        const ct = res.headers['content-type'] || '';
        if (!ct.startsWith('image/')) {
          res.resume();
          return reject(new Error(`Not an image: ${ct}`));
        }

        const ext = ct.includes('png')  ? '.png'  :
                    ct.includes('gif')  ? '.gif'  :
                    ct.includes('webp') ? '.webp' : '.jpg';

        const filename = `${hash}${ext}`;
        const filepath = path.join(UPLOADS_DIR, filename);
        let file;
        try { file = fs.createWriteStream(filepath); } catch (err) { return reject(err); }

        res.pipe(file);
        file.on('finish', () => file.close(() => resolve(`/uploads/${filename}`)));
        file.on('error', (err) => { try { fs.unlinkSync(filepath); } catch {} reject(err); });
      });

      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Download timeout')); });
    }

    fetch(sourceUrl, 0);
  });
}

module.exports = { downloadImage, UPLOADS_DIR };

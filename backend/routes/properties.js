'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, employeeOrAdmin } = require('../middleware/auth');
const db = require('../database');
const {
  normalizeImages,
  toPropertyResponse,
  parsePropertyNumber,
} = require('../utils/property');
const { downloadImage } = require('../utils/imageDownload');

async function localizeImages(images) {
  return Promise.all(images.map(async (src) => {
    if (!src || !src.startsWith('http')) return src;
    try { return await downloadImage(src); } catch { return src; }
  }));
}

const router = express.Router();

const ALLOWED_STATUSES = new Set(['active', 'disabled', 'sold', 'rented']);

const MUTABLE_FIELDS = [
  'title', 'titleEn', 'titleRu',
  'description', 'descriptionEn', 'descriptionRu',
  'city', 'cityEn', 'cityRu',
  'zone', 'zoneEn', 'zoneRu',
  'type', 'sqMeters', 'bedrooms', 'bathrooms', 'floor',
  'price', 'pricePerSqm', 'priceNote', 'currency', 'image', 'images', 'videoUrl', 'status', 'featured',
  'listingRef', 'category',
];

const ALLOWED_CATEGORIES = new Set(['residential', 'commercial', 'land']);

function rowToProperty(row) {
  if (!row) return null;
  return {
    ...row,
    images:      JSON.parse(row.images || '[]'),
    sqMeters:    Number(row.sqMeters),
    bedrooms:    Number(row.bedrooms),
    bathrooms:   Number(row.bathrooms),
    floor:       Number(row.floor),
    price:       Number(row.price),
    pricePerSqm: Number(row.pricePerSqm || 0),
    featured:    row.featured ? 1 : 0,
  };
}

function sanitizeUpdates(body) {
  const out = {};
  MUTABLE_FIELDS.forEach(f => { if (body[f] !== undefined) out[f] = body[f]; });

  if (out.status && !ALLOWED_STATUSES.has(out.status)) return { error: 'Invalid status value' };

  if (out.sqMeters  !== undefined) out.sqMeters  = parsePropertyNumber(out.sqMeters);
  if (out.bedrooms  !== undefined) out.bedrooms  = parsePropertyNumber(out.bedrooms);
  if (out.bathrooms !== undefined) out.bathrooms = parsePropertyNumber(out.bathrooms);
  if (out.floor     !== undefined) out.floor     = parsePropertyNumber(out.floor);
  if (out.price       !== undefined) out.price       = parsePropertyNumber(out.price);
  if (out.pricePerSqm !== undefined) out.pricePerSqm = parsePropertyNumber(out.pricePerSqm);
  if (out.priceNote   !== undefined) out.priceNote   = String(out.priceNote).trim();
  if (out.priceNote) { out.price = 0; out.pricePerSqm = 0; }
  if (out.featured    !== undefined) out.featured     = out.featured ? 1 : 0;
  if (out.listingRef  !== undefined) out.listingRef   = String(out.listingRef || '').trim();
  if (out.category    !== undefined) out.category     = ALLOWED_CATEGORIES.has(out.category) ? out.category : 'residential';

  return out;
}

// ── GET /  (filtered list) ────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const { keyword, city, zone, type, category, minSqMeters, maxSqMeters, minPrice, maxPrice, status, page, limit } = req.query;

  const pageNum  = Math.max(1, parseInt(page)  || 1);
  const limitNum = Math.min(500, Math.max(1, parseInt(limit) || 20));
  const offset   = (pageNum - 1) * limitNum;

  const conditions = [];
  const params = [];

  if (status === 'all') {
    // no status filter — used by admin to see all listings
  } else {
    conditions.push('status=?');
    params.push(status || 'active');
  }

  if (keyword) {
    const kw = `%${keyword.toLowerCase()}%`;
    conditions.push(`(
      LOWER(title)  LIKE ? OR LOWER(titleEn)  LIKE ? OR LOWER(titleRu)  LIKE ? OR
      LOWER(city)   LIKE ? OR LOWER(cityEn)   LIKE ? OR LOWER(cityRu)   LIKE ? OR
      LOWER(zone)   LIKE ? OR LOWER(zoneEn)   LIKE ? OR LOWER(zoneRu)   LIKE ?
    )`);
    params.push(kw, kw, kw, kw, kw, kw, kw, kw, kw);
  }
  if (city)        { conditions.push('(city=? OR cityEn=? OR cityRu=?)'); params.push(city, city, city); }
  if (zone)        { conditions.push('(zone=? OR zoneEn=? OR zoneRu=?)'); params.push(zone, zone, zone); }
  if (type)        { conditions.push('type=?');       params.push(type); }
  if (category)    { conditions.push('category=?');  params.push(category); }
  if (minSqMeters) { conditions.push('sqMeters>=?');  params.push(parsePropertyNumber(minSqMeters)); }
  if (maxSqMeters) { conditions.push('sqMeters<=?');  params.push(parsePropertyNumber(maxSqMeters, Number.MAX_SAFE_INTEGER)); }
  if (minPrice)    { conditions.push('price>=?');     params.push(parsePropertyNumber(minPrice)); }
  if (maxPrice)    { conditions.push('price<=?');     params.push(parsePropertyNumber(maxPrice, Number.MAX_SAFE_INTEGER)); }

  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
  const { total } = db.prepare(`SELECT COUNT(*) as total FROM properties${where}`).get(...params);

  const cols = `id,title,titleEn,titleRu,description,descriptionEn,descriptionRu,
    city,cityEn,cityRu,zone,zoneEn,zoneRu,
    type,sqMeters,bedrooms,bathrooms,floor,price,pricePerSqm,priceNote,currency,
    image,videoUrl,status,featured,listingRef,category,source,externalId,
    createdAt,createdBy,updatedAt,soldBy,soldAt,rentedBy,rentedAt`;
  const rows = db.prepare(`SELECT ${cols} FROM properties${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`)
    .all(...params, limitNum, offset);

  res.json({
    properties: rows.map(r => ({ ...rowToProperty({ ...r, images: '[]' }), images: [] })).map(toPropertyResponse),
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

// ── GET /cities ───────────────────────────────────────────────────────────────
router.get('/cities', (req, res) => {
  const rows = db.prepare(
    'SELECT city, cityEn, cityRu FROM properties GROUP BY cityEn ORDER BY cityEn ASC, city ASC'
  ).all();
  res.json(rows.map(r => ({ ge: r.city, en: r.cityEn, ru: r.cityRu })));
});

// ── GET /zones/:city ──────────────────────────────────────────────────────────
router.get('/zones/:city', (req, res) => {
  const { city } = req.params;
  const seen = new Set();
  const zones = [];
  db.prepare('SELECT zone, zoneEn, zoneRu FROM properties WHERE city=? OR cityEn=? OR cityRu=? ORDER BY zoneEn ASC, zone ASC')
    .all(city, city, city)
    .forEach(row => {
      if (!seen.has(row.zoneEn)) {
        seen.add(row.zoneEn);
        zones.push({ ge: row.zone, en: row.zoneEn, ru: row.zoneRu });
      }
    });
  res.json(zones);
});

// ── GET /featured ─────────────────────────────────────────────────────────────
router.get('/featured', (req, res) => {
  const cols = `id,title,titleEn,titleRu,city,cityEn,cityRu,zone,zoneEn,zoneRu,
    type,sqMeters,bedrooms,bathrooms,floor,price,pricePerSqm,priceNote,currency,
    image,videoUrl,status,featured,listingRef,category,createdAt`;
  const rows = db.prepare(`SELECT ${cols} FROM properties WHERE featured=1 AND status='active' ORDER BY createdAt DESC`).all();
  res.json(rows.map(r => toPropertyResponse(rowToProperty({ ...r, images: '[]' }))));
});

// ── GET /:id ──────────────────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM properties WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ message: 'Property not found' });
  res.json(toPropertyResponse(rowToProperty(row)));
});

// ── POST /  (create) ──────────────────────────────────────────────────────────
router.post('/', authMiddleware, employeeOrAdmin, async (req, res) => {
  try {
    const {
      title, titleEn, titleRu,
      description, descriptionEn, descriptionRu,
      city, cityEn, cityRu,
      zone, zoneEn, zoneRu,
      type, sqMeters, bedrooms, bathrooms, floor,
      price, pricePerSqm, priceNote, currency,
      image, images, videoUrl,
      listingRef, category,
      source, externalId,
    } = req.body;

    const hasPrivatePrice  = Boolean(priceNote?.trim());
    const hasPublicPrice   = price !== undefined && price !== null && price !== '';
    const hasPricePerSqm   = pricePerSqm !== undefined && pricePerSqm !== null && pricePerSqm !== '' && Number(pricePerSqm) > 0;

    if (!title || !titleEn || !titleRu || !city || !type || (!hasPrivatePrice && !hasPublicPrice && !hasPricePerSqm)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const rawImages = normalizeImages({ image, images });
    const imagesArr = await localizeImages(rawImages);
    const p = {
      id:            uuidv4(),
      title,         titleEn,       titleRu,
      description:   description    || '',
      descriptionEn: descriptionEn  || '',
      descriptionRu: descriptionRu  || '',
      city,
      cityEn:        cityEn         || '',
      cityRu:        cityRu         || '',
      zone:          zone           || '',
      zoneEn:        zoneEn         || '',
      zoneRu:        zoneRu         || '',
      type,
      sqMeters:      parsePropertyNumber(sqMeters),
      bedrooms:      parsePropertyNumber(bedrooms),
      bathrooms:     parsePropertyNumber(bathrooms),
      floor:         parsePropertyNumber(floor),
      price:         hasPrivatePrice ? 0 : parsePropertyNumber(price),
      pricePerSqm:   hasPrivatePrice ? 0 : parsePropertyNumber(pricePerSqm),
      priceNote:     hasPrivatePrice ? priceNote.trim() : '',
      currency:      currency  || 'USD',
      image:         imagesArr[0] || image || '',
      images:        JSON.stringify(imagesArr),
      videoUrl:      videoUrl  || '',
      listingRef:    listingRef ? String(listingRef).trim() : '',
      category:      ALLOWED_CATEGORIES.has(category) ? category : 'residential',
      source:        source    || 'manual',
      externalId:    externalId || null,
      status:        'active',
      createdAt:     new Date().toISOString(),
      createdBy:     req.user.id,
    };

    db.prepare(`
      INSERT INTO properties (
        id, title, titleEn, titleRu, description, descriptionEn, descriptionRu,
        city, cityEn, cityRu, zone, zoneEn, zoneRu, type, sqMeters, bedrooms,
        bathrooms, floor, price, pricePerSqm, priceNote, currency, image, images,
        videoUrl, listingRef, category, source, externalId, status, createdAt, createdBy
      ) VALUES (
        @id, @title, @titleEn, @titleRu, @description, @descriptionEn, @descriptionRu,
        @city, @cityEn, @cityRu, @zone, @zoneEn, @zoneRu, @type, @sqMeters, @bedrooms,
        @bathrooms, @floor, @price, @pricePerSqm, @priceNote, @currency, @image, @images,
        @videoUrl, @listingRef, @category, @source, @externalId, @status, @createdAt, @createdBy
      )
    `).run(p);

    res.status(201).json(toPropertyResponse({ ...p, images: imagesArr }));
  } catch (err) {
    console.error('POST /properties error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── POST /import  (bulk upsert) ───────────────────────────────────────────────
router.post('/import', authMiddleware, employeeOrAdmin, async (req, res) => {
  try {
  const { listings = [], source = 'facebook' } = req.body;
  if (!Array.isArray(listings)) return res.status(400).json({ message: 'listings must be an array' });

  // Download all external images first so they're stored permanently
  const localizedListings = await Promise.all(listings.map(async (listing) => {
    const raw = normalizeImages(listing);
    const local = await localizeImages(raw);
    return { ...listing, images: local, image: local[0] || listing.image || '' };
  }));

  const results = { created: 0, updated: 0, skipped: 0 };

  db.transaction(() => {
    localizedListings.forEach(listing => {
      if (!listing.title && !listing.titleEn && !listing.titleRu) { results.skipped += 1; return; }

      const externalId = listing.externalId || listing.id || null;
      const imagesArr  = normalizeImages(listing);
      const existing   = externalId
        ? db.prepare('SELECT id FROM properties WHERE externalId=?').get(externalId)
        : null;

      if (existing) {
        db.prepare(`
          UPDATE properties SET
            title=@title, titleEn=@titleEn, titleRu=@titleRu,
            description=@description, descriptionEn=@descriptionEn, descriptionRu=@descriptionRu,
            city=@city, cityEn=@cityEn, cityRu=@cityRu,
            zone=@zone, zoneEn=@zoneEn, zoneRu=@zoneRu,
            type=@type, sqMeters=@sqMeters, bedrooms=@bedrooms, bathrooms=@bathrooms,
            floor=@floor, price=@price, priceNote=@priceNote, currency=@currency,
            image=@image, images=@images, videoUrl=@videoUrl,
            source=@source, externalId=@externalId, updatedAt=@updatedAt
          WHERE id=@id
        `).run({
          ...listing,
          id:         existing.id,
          source:     listing.source || source,
          images:     JSON.stringify(imagesArr),
          image:      listing.image || imagesArr[0] || '',
          externalId,
          updatedAt:  new Date().toISOString(),
          sqMeters:   parsePropertyNumber(listing.sqMeters),
          bedrooms:   parsePropertyNumber(listing.bedrooms),
          bathrooms:  parsePropertyNumber(listing.bathrooms),
          floor:      parsePropertyNumber(listing.floor),
          price:      parsePropertyNumber(listing.price),
        });
        results.updated += 1;
      } else {
        db.prepare(`
          INSERT INTO properties (
            id, title, titleEn, titleRu, description, descriptionEn, descriptionRu,
            city, cityEn, cityRu, zone, zoneEn, zoneRu, type, sqMeters, bedrooms,
            bathrooms, floor, price, priceNote, currency, image, images,
            videoUrl, source, externalId, status, createdAt, createdBy
          ) VALUES (
            @id, @title, @titleEn, @titleRu, @description, @descriptionEn, @descriptionRu,
            @city, @cityEn, @cityRu, @zone, @zoneEn, @zoneRu, @type, @sqMeters, @bedrooms,
            @bathrooms, @floor, @price, @priceNote, @currency, @image, @images,
            @videoUrl, @source, @externalId, @status, @createdAt, @createdBy
          )
        `).run({
          id:            uuidv4(),
          title:         listing.title         || '',
          titleEn:       listing.titleEn       || '',
          titleRu:       listing.titleRu       || '',
          description:   listing.description   || '',
          descriptionEn: listing.descriptionEn || '',
          descriptionRu: listing.descriptionRu || '',
          city:          listing.city          || '',
          cityEn:        listing.cityEn        || '',
          cityRu:        listing.cityRu        || '',
          zone:          listing.zone          || '',
          zoneEn:        listing.zoneEn        || '',
          zoneRu:        listing.zoneRu        || '',
          type:          listing.type          || 'sale',
          sqMeters:      parsePropertyNumber(listing.sqMeters),
          bedrooms:      parsePropertyNumber(listing.bedrooms),
          bathrooms:     parsePropertyNumber(listing.bathrooms),
          floor:         parsePropertyNumber(listing.floor),
          price:         parsePropertyNumber(listing.price),
          priceNote:     listing.priceNote     || '',
          currency:      listing.currency      || 'USD',
          image:         listing.image || imagesArr[0] || '',
          images:        JSON.stringify(imagesArr),
          videoUrl:      listing.videoUrl      || '',
          source:        listing.source || source,
          externalId,
          status:        listing.status || 'active',
          createdAt:     new Date().toISOString(),
          createdBy:     req.user.id,
        });
        results.created += 1;
      }
    });
  })();

  res.status(201).json({ message: 'Import completed', ...results });
  } catch (err) {
    console.error('POST /properties/import error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /:id  (update) ────────────────────────────────────────────────────────
router.put('/:id', authMiddleware, employeeOrAdmin, async (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM properties WHERE id=?').get(req.params.id);
    if (!row) return res.status(404).json({ message: 'Property not found' });

    const sanitized = sanitizeUpdates(req.body);
    if (sanitized.error) return res.status(400).json({ message: sanitized.error });

    const extra = {};
    if (sanitized.status === 'sold')   { extra.soldBy   = req.user.id; extra.soldAt   = new Date().toISOString(); }
    if (sanitized.status === 'rented') { extra.rentedBy  = req.user.id; extra.rentedAt = new Date().toISOString(); }

    const merged = { ...rowToProperty(row), ...sanitized, ...extra, updatedAt: new Date().toISOString() };

    const rawImages = normalizeImages({ image: merged.image, images: merged.images });
    const imagesArr = await localizeImages(rawImages);
    merged.images = JSON.stringify(imagesArr);
    merged.image  = imagesArr[0] || merged.image || '';

    db.prepare(`
      UPDATE properties SET
        title=@title, titleEn=@titleEn, titleRu=@titleRu,
        description=@description, descriptionEn=@descriptionEn, descriptionRu=@descriptionRu,
        city=@city, cityEn=@cityEn, cityRu=@cityRu,
        zone=@zone, zoneEn=@zoneEn, zoneRu=@zoneRu,
        type=@type, sqMeters=@sqMeters, bedrooms=@bedrooms, bathrooms=@bathrooms,
        floor=@floor, price=@price, pricePerSqm=@pricePerSqm, priceNote=@priceNote, currency=@currency,
        image=@image, images=@images, videoUrl=@videoUrl, listingRef=@listingRef, category=@category,
        status=@status, featured=@featured,
        updatedAt=@updatedAt, soldBy=@soldBy, soldAt=@soldAt,
        rentedBy=@rentedBy, rentedAt=@rentedAt
      WHERE id=@id
    `).run(merged);

    res.json(toPropertyResponse({ ...merged, images: imagesArr }));
  } catch (err) {
    console.error('PUT /properties/:id error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /:id ───────────────────────────────────────────────────────────────
router.delete('/:id', authMiddleware, employeeOrAdmin, (req, res) => {
  const info = db.prepare('DELETE FROM properties WHERE id=?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ message: 'Property not found' });
  res.json({ message: 'Property deleted successfully' });
});

module.exports = router;

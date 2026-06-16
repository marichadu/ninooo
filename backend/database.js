'use strict';

const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'vesta.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ────────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS properties (
    id            TEXT PRIMARY KEY,
    title         TEXT NOT NULL DEFAULT '',
    titleEn       TEXT NOT NULL DEFAULT '',
    titleRu       TEXT NOT NULL DEFAULT '',
    description   TEXT DEFAULT '',
    descriptionEn TEXT DEFAULT '',
    descriptionRu TEXT DEFAULT '',
    city          TEXT NOT NULL DEFAULT '',
    cityEn        TEXT DEFAULT '',
    cityRu        TEXT DEFAULT '',
    zone          TEXT DEFAULT '',
    zoneEn        TEXT DEFAULT '',
    zoneRu        TEXT DEFAULT '',
    type          TEXT NOT NULL DEFAULT 'sale',
    sqMeters      REAL NOT NULL DEFAULT 0,
    bedrooms      INTEGER DEFAULT 0,
    bathrooms     INTEGER DEFAULT 0,
    floor         INTEGER DEFAULT 0,
    price         REAL DEFAULT 0,
    priceNote     TEXT DEFAULT '',
    currency      TEXT DEFAULT 'USD',
    image         TEXT DEFAULT '',
    images        TEXT DEFAULT '[]',
    videoUrl      TEXT DEFAULT '',
    source        TEXT DEFAULT 'manual',
    externalId    TEXT,
    status        TEXT DEFAULT 'active',
    createdAt     TEXT NOT NULL,
    createdBy     TEXT NOT NULL,
    updatedAt     TEXT,
    soldBy        TEXT,
    soldAt        TEXT,
    rentedBy      TEXT,
    rentedAt      TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id        TEXT PRIMARY KEY,
    email     TEXT UNIQUE NOT NULL,
    password  TEXT NOT NULL,
    role      TEXT NOT NULL,
    name      TEXT NOT NULL,
    managerId TEXT
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id            TEXT PRIMARY KEY,
    name          TEXT DEFAULT '',
    email         TEXT DEFAULT '',
    subject       TEXT DEFAULT '',
    message       TEXT DEFAULT '',
    propertyId    TEXT,
    propertyTitle TEXT,
    status        TEXT DEFAULT 'new',
    createdAt     TEXT NOT NULL,
    updatedAt     TEXT
  );
`);

// ── Indexes ───────────────────────────────────────────────────────────────────
try { db.exec('CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status)'); } catch {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_properties_status_created ON properties(status, createdAt DESC)'); } catch {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_properties_listingRef ON properties(listingRef)'); } catch {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured, status)'); } catch {}

// ── Migrations ───────────────────────────────────────────────────────────────
try { db.exec('ALTER TABLE properties ADD COLUMN pricePerSqm REAL DEFAULT 0'); } catch {}
try { db.exec('ALTER TABLE properties ADD COLUMN featured INTEGER DEFAULT 0'); } catch {}
try { db.exec("ALTER TABLE properties ADD COLUMN soldBy TEXT"); } catch {}
try { db.exec("ALTER TABLE properties ADD COLUMN soldAt TEXT"); } catch {}
try { db.exec("ALTER TABLE properties ADD COLUMN rentedBy TEXT"); } catch {}
try { db.exec("ALTER TABLE properties ADD COLUMN rentedAt TEXT"); } catch {}
try { db.exec("ALTER TABLE properties ADD COLUMN listingRef TEXT"); } catch {}
try { db.exec("ALTER TABLE properties ADD COLUMN category TEXT DEFAULT 'residential'"); } catch {}

// ── Employee accounts (idempotent) ────────────────────────────────────────────
const EMPLOYEE_HASH = '$2a$10$QoYp/MBapHxyA5FPwn0D6eO.8yO/ZRbZKXun8uzrlYYr9fVEfpAAO';
if (!db.prepare('SELECT id FROM users WHERE email=?').get('gio@realestate.com')) {
  db.prepare('INSERT INTO users (id, email, password, role, name, managerId) VALUES (?, ?, ?, ?, ?, ?)')
    .run(uuidv4(), 'gio@realestate.com', EMPLOYEE_HASH, 'employee', 'გიორგი', null);
}
if (!db.prepare('SELECT id FROM users WHERE email=?').get('anano@realestate.com')) {
  db.prepare('INSERT INTO users (id, email, password, role, name, managerId) VALUES (?, ?, ?, ?, ?, ?)')
    .run(uuidv4(), 'anano@realestate.com', EMPLOYEE_HASH, 'employee', 'ანანო', null);
}

// ── Seed on first run ─────────────────────────────────────────────────────────
if (!db.prepare('SELECT id FROM users WHERE email=?').get('admin@realestate.com')) {
  const adminId = uuidv4();
  const emp1Id  = uuidv4();
  const emp2Id  = uuidv4();

  const insUser = db.prepare(
    'INSERT INTO users (id, email, password, role, name, managerId) VALUES (?, ?, ?, ?, ?, ?)'
  );

  db.transaction(() => {
    insUser.run(adminId, 'admin@realestate.com',
      '$2a$10$I5mW4JSxppsGEG/.LKBfcOC2Qde48jTL/NXEXSrDQP3PUzLTlf7w.',
      'admin', 'ნინო', null);
    insUser.run(emp1Id, 'employee@realestate.com',
      '$2a$10$QoYp/MBapHxyA5FPwn0D6eO.8yO/ZRbZKXun8uzrlYYr9fVEfpAAO',
      'employee', 'ანანო', adminId);
    insUser.run(emp2Id, 'giorgi@realestate.com',
      '$2a$10$QoYp/MBapHxyA5FPwn0D6eO.8yO/ZRbZKXun8uzrlYYr9fVEfpAAO',
      'employee', 'გიორგი', adminId);
  })();

  const insProp = db.prepare(`
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
  `);

  db.transaction(() => {
    [
      {
        id: uuidv4(),
        title: 'ფაქტორი კერძო სახლი', titleEn: 'Spacious House in Tbilisi', titleRu: 'Просторный дом в Тбилиси',
        description: 'ძალიან თვალი მოსახვევი კერძო სახლი თბილისის ფაქტორის უბანში',
        descriptionEn: 'Beautiful private house in Factors district with modern amenities',
        descriptionRu: 'Красивый частный дом в районе Факторз с современными удобствами',
        city: 'თბილისი', cityEn: 'Tbilisi', cityRu: 'Тбилиси',
        zone: 'ფაქტორი', zoneEn: 'Factors', zoneRu: 'Факторз',
        type: 'sale', sqMeters: 250, bedrooms: 4, bathrooms: 2, floor: 2,
        price: 350000, priceNote: '', currency: 'USD',
        image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80',
        images: JSON.stringify(['https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80']),
        videoUrl: '', source: 'manual', externalId: null, status: 'active',
        createdAt: '2024-01-15T00:00:00.000Z', createdBy: adminId,
      },
      {
        id: uuidv4(),
        title: 'მოდერნული ბინა ვაკეში', titleEn: 'Modern Apartment in Vake', titleRu: 'Современная квартира в Ваке',
        description: 'ახლად რემონტირებული 2-ოთახიანი ბინა მშვიდი უბნით',
        descriptionEn: 'Recently renovated 2-bedroom apartment with beautiful view',
        descriptionRu: 'Недавно отремонтированная 2-комнатная квартира с красивым видом',
        city: 'თბილისი', cityEn: 'Tbilisi', cityRu: 'Тбილиси',
        zone: 'ვაკე', zoneEn: 'Vake', zoneRu: 'Ваке',
        type: 'rent', sqMeters: 85, bedrooms: 2, bathrooms: 1, floor: 5,
        price: 1200, priceNote: '', currency: 'USD',
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
        images: JSON.stringify(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80']),
        videoUrl: '', source: 'manual', externalId: null, status: 'active',
        createdAt: '2024-02-10T00:00:00.000Z', createdBy: adminId,
      },
      {
        id: uuidv4(),
        title: 'ოქროს ხიდის ბინა', titleEn: 'Apartment near Golden Bridge', titleRu: 'Квартира рядом с Золотым мостом',
        description: 'ნაჭილი ფერდი ოქროს ხიდის მახლობლად ხელი მოკიდებული პოზიცია',
        descriptionEn: 'Luxury apartment with stunning city views near Golden Bridge',
        descriptionRu: 'Люксовая квартира с потрясающим видом на город рядом с Золотым мостом',
        city: 'თბილისი', cityEn: 'Tbilisi', cityRu: 'Тбილиси',
        zone: 'ოქროს ხიდი', zoneEn: 'Golden Bridge', zoneRu: 'Золотой мост',
        type: 'sale', sqMeters: 120, bedrooms: 3, bathrooms: 2, floor: 12,
        price: 450000, priceNote: '', currency: 'USD',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        images: JSON.stringify(['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80']),
        videoUrl: '', source: 'manual', externalId: null, status: 'active',
        createdAt: '2024-01-05T00:00:00.000Z', createdBy: adminId,
      },
      {
        id: uuidv4(),
        title: 'სიჰოვიტელი სახლი მწვანე ტერიტორიაზე', titleEn: 'Country Villa with Garden', titleRu: 'Загородная вилла с садом',
        description: 'დამაქვემდებარებელი სამეზობლო დიდი სახლი',
        descriptionEn: 'Spacious country villa with large garden and pool',
        descriptionRu: 'Просторная загородная вилла с большим садом и бассейном',
        city: 'თბილისი', cityEn: 'Tbilisi', cityRu: 'Тбилиси',
        zone: 'ციხე-დაბა', zoneEn: 'Tsikhe-Daba', zoneRu: 'Цихе-Баба',
        type: 'sale', sqMeters: 450, bedrooms: 5, bathrooms: 3, floor: 1,
        price: 850000, priceNote: '', currency: 'USD',
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
        images: JSON.stringify(['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80']),
        videoUrl: '', source: 'manual', externalId: null, status: 'active',
        createdAt: '2024-01-25T00:00:00.000Z', createdBy: adminId,
      },
      {
        id: uuidv4(),
        title: 'იყიდება ბინა ისანში!', titleEn: 'Apartment for sale in Isani!', titleRu: 'Квартира на продажу в Исани!',
        description: '66 კვ.მ 3 ოთახიანი ნათელი, მყუდრო და სრულად მოწყობილი ბინა.',
        descriptionEn: '66 sqm, 3-room bright, cozy and fully furnished apartment. 11th floor of a 12-story building. Solomon Dodashvili 22.',
        descriptionRu: '66 кв.м, 3-комнатная светлая, уютная и полностью меблированная квартира. 11 этаж.',
        city: 'თბილისი', cityEn: 'Tbilisi', cityRu: 'Тбилиси',
        zone: 'ისანი', zoneEn: 'Isani', zoneRu: 'Исани',
        type: 'sale', sqMeters: 66, bedrooms: 3, bathrooms: 1, floor: 11,
        price: 0, priceNote: 'Price in private', currency: 'USD',
        image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        ]),
        videoUrl: '', source: 'manual', externalId: null, status: 'active',
        createdAt: '2026-05-19T00:00:00.000Z', createdBy: adminId,
      },
    ].forEach(p => insProp.run(p));
  })();

  console.log('✓ Database seeded with initial data');
}

module.exports = db;

const DEFAULT_PROPERTY_IMAGE = 'https://images.unsplash.com/photo-1570129477492-45c003d96e7f?w=800&q=80';

const normalizeImages = (property = {}) => {
  const images = Array.isArray(property.images)
    ? property.images.filter(Boolean)
    : [];

  if (!images.length && property.image) {
    images.push(property.image);
  }

  return images;
};

const toPropertyResponse = (property) => {
  const images = normalizeImages(property);

  return {
    ...property,
    images,
    image: property.image || images[0] || DEFAULT_PROPERTY_IMAGE
  };
};

const applyPropertyStatus = (property, status, userId) => {
  if (status === 'sold') {
    property.status = 'sold';
    property.soldBy = userId;
    property.soldAt = new Date();
    return;
  }

  if (status === 'rented') {
    property.status = 'rented';
    property.rentedBy = userId;
    property.rentedAt = new Date();
    return;
  }

  if (status === 'active' || status === 'disabled') {
    property.status = status;
  }
};

const parsePropertyNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const getPriceLabel = (property) => {
  if (property?.priceNote) {
    return property.priceNote;
  }

  return `${property?.price?.toLocaleString?.() || '0'} ${property?.currency || ''}`.trim();
};

const sortByNewest = (items = []) => [...items].sort((left, right) => {
  const leftTime = new Date(left?.createdAt || 0).getTime();
  const rightTime = new Date(right?.createdAt || 0).getTime();
  return rightTime - leftTime;
});

module.exports = {
  DEFAULT_PROPERTY_IMAGE,
  normalizeImages,
  toPropertyResponse,
  applyPropertyStatus,
  parsePropertyNumber,
  getPriceLabel,
  sortByNewest
};
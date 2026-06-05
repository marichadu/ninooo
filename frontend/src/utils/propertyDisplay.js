export const FALLBACK_PROPERTY_IMAGE = 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=1200&q=80';

const currencySymbol = (currency) => {
  if (currency === 'USD') return '$';
  if (currency === 'GEL') return '₾';
  if (currency === 'EUR') return '€';
  return currency || '';
};

export const renderPrice = (property) => {
  if (property?.priceNote) return property.priceNote;
  const sym = currencySymbol(property?.currency);
  if (property?.pricePerSqm > 0) {
    return `${sym}${property.pricePerSqm.toLocaleString()}/m²`;
  }
  return `${sym}${property?.price?.toLocaleString?.() || '0'}`;
};

export const sortByNewest = (items = []) => [...items].sort((left, right) => {
  const leftTime = new Date(left?.createdAt || 0).getTime();
  const rightTime = new Date(right?.createdAt || 0).getTime();
  return rightTime - leftTime;
});
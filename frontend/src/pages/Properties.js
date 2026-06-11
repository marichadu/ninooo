import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { propertyService, authService } from '../services/api';
import { FALLBACK_PROPERTY_IMAGE, renderPrice, safeImageSrc } from '../utils/propertyDisplay';
import '../styles/Properties.css';

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconFilter = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

function parseFiltersFromSearch(search) {
  const params = new URLSearchParams(search);
  return {
    keyword:     params.get('keyword')     || '',
    city:        params.get('city')        || '',
    zone:        params.get('zone')        || '',
    type:        params.get('type')        || '',
    category:    params.get('category')    || '',
    minPrice:    params.get('minPrice')    || '',
    maxPrice:    params.get('maxPrice')    || '',
    minSqMeters: params.get('minSqMeters') || '',
    maxSqMeters: params.get('maxSqMeters') || '',
  };
}

function Properties() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [zones, setZones] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(() => parseFiltersFromSearch(location.search));
  const [keywordInput, setKeywordInput] = useState(() => parseFiltersFromSearch(location.search).keyword);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const prevFilters = useRef(filters);

  const resolveLocaleValue = (valueSet, geKey, enKey, ruKey) => {
    if (i18n.language === 'ka') return valueSet[geKey] || valueSet[enKey] || valueSet[ruKey] || '';
    if (i18n.language === 'ru') return valueSet[ruKey] || valueSet[enKey] || valueSet[geKey] || '';
    return valueSet[enKey] || valueSet[geKey] || valueSet[ruKey] || '';
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await propertyService.getCities();
        setCities(data.sort((a, b) => (a.en || a.ge || '').localeCompare(b.en || b.ge || '')));
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    })();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, keyword: keywordInput }));
    }, 400);
    return () => clearTimeout(timer);
  }, [keywordInput]);

  useEffect(() => {
    if (prevFilters.current !== filters) {
      prevFilters.current = filters;
      setPage(1);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const result = await propertyService.getAll({ ...filters, page, limit: 20 });
        setProperties(result.properties || []);
        setTotal(result.total || 0);
        setTotalPages(result.totalPages || 1);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [filters, page]);

  useEffect(() => {
    if (!filters.city) { setZones([]); return; }
    (async () => {
      try {
        const data = await propertyService.getZones(filters.city);
        setZones(data.sort((a, b) => (a.en || a.ge || '').localeCompare(b.en || b.ge || '')));
      } catch (error) {
        console.error('Error fetching zones:', error);
      }
    })();
  }, [filters.city]);

  useEffect(() => {
    const next = parseFiltersFromSearch(location.search);
    if (Object.values(next).some(Boolean)) {
      setFilters(next);
      setKeywordInput(next.keyword || '');
    }
  }, [location.search]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'keyword') {
      setKeywordInput(value);
    } else {
      setFilters(prev => ({ ...prev, [name]: value, ...(name === 'city' ? { zone: '' } : {}) }));
    }
  };

  const handleClearFilters = () => {
    setKeywordInput('');
    setFilters({ keyword: '', city: '', zone: '', type: '', category: '', minPrice: '', maxPrice: '', minSqMeters: '', maxSqMeters: '' });
  };

  const types = [
    { value: 'rent', label: t('properties.rent') },
    { value: 'sale', label: t('properties.sale') }
  ];

  const user = authService.getUser();
  const isStaff = user?.role === 'admin' || user?.role === 'employee';
  const selectedCity = cities.find(c => c.en === filters.city);
  const activeFiltersCount = Object.entries(filters).filter(([k, v]) => k !== 'keyword' && v).length;

  const filterPanel = (
    <aside className={`filters-section properties-sidebar${showFilters ? ' is-open' : ''}`}>
      <div className="filters-header">
        <h2>{t('properties.filter')}</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {activeFiltersCount > 0 && (
            <button type="button" className="text-button" onClick={handleClearFilters}>
              {t('common.clear')}
            </button>
          )}
          <button type="button" className="filters-close-btn" onClick={() => setShowFilters(false)} aria-label="Close filters">
            <IconClose />
          </button>
        </div>
      </div>

      <div className="filters-grid">
        <div className="filter-group">
          <label>{t('properties.city')}</label>
          <select name="city" value={filters.city} onChange={handleFilterChange}>
            <option value="">{t('common.all')}</option>
            {cities.map(city => (
              <option key={city.en} value={city.en}>{resolveLocaleValue(city, 'ge', 'en', 'ru')}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>{t('properties.zone')}</label>
          <select name="zone" value={filters.zone} onChange={handleFilterChange} disabled={!filters.city}>
            <option value="">{t('common.all')}</option>
            {zones.map(zone => (
              <option key={zone.en} value={zone.en}>{resolveLocaleValue(zone, 'ge', 'en', 'ru')}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>{t('properties.type')}</label>
          <select name="type" value={filters.type} onChange={handleFilterChange}>
            <option value="">{t('common.all')}</option>
            {types.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>{t('properties.category')}</label>
          <select name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="">{t('common.all')}</option>
            <option value="residential">{t('properties.residential')}</option>
            <option value="commercial">{t('properties.commercial')}</option>
            <option value="land">{t('properties.land')}</option>
          </select>
        </div>

        <div className="filter-group">
          <label>{t('properties.minPrice')}</label>
          <input type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} placeholder="0" />
        </div>

        <div className="filter-group">
          <label>{t('properties.maxPrice')}</label>
          <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} placeholder="—" />
        </div>

        <div className="filter-group">
          <label>{t('properties.minSqMeters')}</label>
          <input type="number" name="minSqMeters" value={filters.minSqMeters} onChange={handleFilterChange} placeholder="0" />
        </div>

        <div className="filter-group">
          <label>{t('properties.maxSqMeters')}</label>
          <input type="number" name="maxSqMeters" value={filters.maxSqMeters} onChange={handleFilterChange} placeholder="—" />
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {showFilters && <div className="filters-overlay" onClick={() => setShowFilters(false)} />}
      <div className="properties-page">
        <div className="container properties-container">

          <div className="properties-topbar">
            <div className="properties-title-row">
              <h1>{t('properties.title')}</h1>
              {isStaff && <span className="results-count">{properties.length}</span>}
            </div>
            <div className="properties-searchbar">
              <button
                type="button"
                className="filters-toggle-btn"
                onClick={() => setShowFilters(true)}
                aria-label={t('properties.showFilters')}
              >
                <IconFilter />
                <span>{t('properties.showFilters')}</span>
                {activeFiltersCount > 0 && <span className="filter-badge">{activeFiltersCount}</span>}
              </button>
              <div className="search-input-wrapper">
                <span className="search-icon"><IconSearch /></span>
                <input
                  type="text"
                  name="keyword"
                  value={keywordInput}
                  onChange={handleFilterChange}
                  placeholder={t('properties.search')}
                  className="properties-keyword-input"
                />
                {keywordInput && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => { setKeywordInput(''); setFilters(prev => ({ ...prev, keyword: '' })); }}
                    aria-label="Clear search"
                  >
                    <IconClose />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="properties-layout">
            {filterPanel}

            <main className="properties-results">
              <div className="results-header">
                <h2>
                  {selectedCity
                    ? resolveLocaleValue(selectedCity, 'ge', 'en', 'ru')
                    : t('common.all')}
                  {filters.type && <span className="results-pill">{filters.type === 'rent' ? t('properties.rent') : t('properties.sale')}</span>}
                </h2>
                {!loading && total > 0 && <span className="results-count">{total}</span>}
              </div>

              {loading && <div className="loading">{t('common.loading')}</div>}

              {!loading && properties.length === 0 && (
                <div className="no-results">{t('properties.noResults')}</div>
              )}

              {!loading && properties.length > 0 && (
                <div className="properties-list">
                  {properties.map(property => (
                    <article key={property.id} className="property-card property-card--row">
                      <div className="property-image">
                        <img
                          src={safeImageSrc(property.image)}
                          alt={resolveLocaleValue(property, 'title', 'titleEn', 'titleRu')}
                          loading="lazy"
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_PROPERTY_IMAGE; }}
                        />
                        <div className="property-badge">
                          {property.type === 'rent' ? t('properties.rent') : t('properties.sale')}
                        </div>
                      </div>

                      <div className="property-content">
                        <div className="property-topline">
                          <span className="property-type-tag">{property.type === 'rent' ? t('properties.rent') : t('properties.sale')}</span>
                          <span className="property-size">{property.sqMeters} m²</span>
                        </div>

                        <h3>
                          {resolveLocaleValue(property, 'title', 'titleEn', 'titleRu')}
                          {property.listingRef && <span className="property-listing-ref">#{property.listingRef}</span>}
                        </h3>

                        <p className="location">
                          {resolveLocaleValue(property, 'city', 'cityEn', 'cityRu')}
                          {resolveLocaleValue(property, 'zone', 'zoneEn', 'zoneRu') ? `, ${resolveLocaleValue(property, 'zone', 'zoneEn', 'zoneRu')}` : ''}
                        </p>

                        <div className="property-specs">
                          {property.bedrooms > 0 && <span>{property.bedrooms} {t('properties.bedrooms')}</span>}
                          {property.bathrooms > 0 && <span>{property.bathrooms} {t('properties.bathrooms')}</span>}
                          <span>{property.sqMeters} m²</span>
                        </div>

                        <div className="property-footer">
                          <div className="price">
                            {renderPrice(property)}
                            {!property.priceNote && property.type === 'rent' && <span className="period"> / {t('properties.pricePerMonth')}</span>}
                          </div>
                          <Link to={`/properties/${property.id}`} className="btn btn-small">
                            {t('properties.details')}
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="properties-pagination">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                  >‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce((acc, p, i, arr) => {
                      if (i > 0 && p - arr[i - 1] > 1) acc.push('…');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) => p === '…'
                      ? <span key={`e${i}`} className="pagination-ellipsis">…</span>
                      : <button key={p} className={`btn ${p === page ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setPage(p)} disabled={loading}>{p}</button>
                    )}
                  <button
                    className="btn btn-secondary"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                  >›</button>
                </div>
              )}
            </main>
          </div>

        </div>
      </div>
    </>
  );
}

export default Properties;

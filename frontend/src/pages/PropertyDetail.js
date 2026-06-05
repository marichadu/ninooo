/* global globalThis */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { propertyService, authService } from '../services/api';
import { FALLBACK_PROPERTY_IMAGE, renderPrice } from '../utils/propertyDisplay';
import '../styles/PropertyDetail.css';

const getLocalizedValue = (language, geValue, ruValue, enValue) => {
  if (language === 'ka') return geValue;
  if (language === 'ru') return ruValue;
  return enValue;
};

const getPropertyField = (language, property, geKey, ruKey, enKey) =>
  getLocalizedValue(language, property[geKey], property[ruKey], property[enKey]);

const getFacebookEmbedUrl = (videoUrl) => {
  if (!videoUrl) return '';
  try {
    const normalizedUrl = new URL(videoUrl);
    if (!normalizedUrl.hostname.includes('facebook.com') && !normalizedUrl.hostname.includes('fb.watch')) {
      return '';
    }
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=false&width=560&height=500`;
  } catch {
    return '';
  }
};

const IconPin = () => (
  <svg className="spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const IconArea = () => (
  <svg className="spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9"/>
    <polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/>
    <line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);

const IconBed = () => (
  <svg className="spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4v16"/>
    <path d="M2 8h18a2 2 0 0 1 2 2v10"/>
    <path d="M2 17h20"/>
    <path d="M6 8v9"/>
  </svg>
);

const IconBath = () => (
  <svg className="spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6 C9 4.34 10.34 3 12 3 S15 4.34 15 6"/>
    <path d="M2 14h20v2a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-2z"/>
    <line x1="4" y1="14" x2="4" y2="10"/>
    <line x1="20" y1="14" x2="20" y2="10"/>
  </svg>
);

const IconFloor = () => (
  <svg className="spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
);

function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const user = authService.getUser();
  const localizedTitle = getPropertyField(i18n.language, property || {}, 'title', 'titleRu', 'titleEn');
  const localizedCity = getPropertyField(i18n.language, property || {}, 'city', 'cityRu', 'cityEn');
  const localizedZone = getPropertyField(i18n.language, property || {}, 'zone', 'zoneRu', 'zoneEn');
  const localizedDescription = getPropertyField(i18n.language, property || {}, 'description', 'descriptionRu', 'descriptionEn');
  const propertyImages = Array.from(new Set([
    ...(Array.isArray(property?.images) ? property.images : []),
    property?.image
  ].filter(src => src && src !== FALLBACK_PROPERTY_IMAGE)));
  const videoUrlList = (() => {
    const raw = property?.videoUrl || '';
    if (!raw) return [];
    try { const a = JSON.parse(raw); if (Array.isArray(a)) return a.filter(Boolean); } catch {}
    return [raw];
  })();
  const imageCount = propertyImages.length;

  const fetchProperty = useCallback(async () => {
    try {
      setLoading(true);
      const data = await propertyService.getById(id);
      setProperty(data);
    } catch (err) {
      setError('Property not found');
      console.error('Error fetching property:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') setLightboxIndex(i => (i - 1 + imageCount) % imageCount);
      if (e.key === 'ArrowRight') setLightboxIndex(i => (i + 1) % imageCount);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIndex, imageCount]);

  const handleDelete = async () => {
    if (globalThis.confirm(t('message.confirmDelete'))) {
      try {
        await propertyService.delete(id);
        navigate('/properties');
      } catch (err) {
        alert(err?.message || t('message.error'));
      }
    }
  };


  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (error || !property) {
    return (
      <div className="container" style={{ marginTop: '40px' }}>
        <div className="error">{error || t('common.notFound')}</div>
        <button className="btn" onClick={() => navigate('/properties')}>
          {t('common.back')}
        </button>
      </div>
    );
  }

  return (
    <div className="property-detail">
      <div className="container">
        <button className="btn btn-back" onClick={() => navigate('/properties')}>
          {t('common.back')}
        </button>

        <div className="detail-grid">
          <div className="detail-media-column">
            {propertyImages.length > 0 && (
              <div className="detail-image">
                <img
                  src={property.image || FALLBACK_PROPERTY_IMAGE}
                  alt={property.title}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setLightboxIndex(0)}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_PROPERTY_IMAGE;
                  }}
                />
                <div className="property-type-badge">
                  {property.type === 'rent' ? t('properties.rent') : t('properties.sale')}
                </div>
              </div>
            )}

            {videoUrlList.map((vUrl, vi) => {
              const embedUrl = getFacebookEmbedUrl(vUrl);
              if (!embedUrl) return null;
              return (
                <div className="detail-video" key={vi}>
                  <div className="detail-video-embed">
                    <iframe
                      src={embedUrl}
                      title={`${property.title} video ${vi + 1}`}
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                  <a href={vUrl} target="_blank" rel="noreferrer" className="detail-video-fallback">
                    Open in Facebook ↗
                  </a>
                </div>
              );
            })}

            {propertyImages.length > 1 && (
              <div className="detail-gallery">
                {propertyImages.slice(1).map((photoUrl, index) => (
                  <img
                    key={`${photoUrl}-${index}`}
                    src={photoUrl}
                    alt={`${property.title} ${index + 2}`}
                    className="gallery-thumb"
                    onClick={() => setLightboxIndex(index + 1)}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_PROPERTY_IMAGE;
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="detail-info">
            <h1>{localizedTitle}</h1>

            <div className="location-info">
              <span className="icon"><IconPin /></span>
              <div>
                <p className="city">{localizedCity}{localizedZone ? `, ${localizedZone}` : ''}</p>
              </div>
            </div>

            <div className="price-section">
              <div className="price">
                {renderPrice(property)}
                {!property.priceNote && property.type === 'rent' && (
                  <span className="period">{' /'} {t('properties.pricePerMonth')}</span>
                )}
              </div>
            </div>

            <div className="specs-grid">
              <div className="spec">
                <span className="icon"><IconArea /></span>
                <div>
                  <p>{property.sqMeters} m²</p>
                  <small>{t('properties.sqMeters')}</small>
                </div>
              </div>
              {property.bedrooms > 0 && (
                <div className="spec">
                  <span className="icon"><IconBed /></span>
                  <div>
                    <p>{property.bedrooms}</p>
                    <small>{t('properties.bedrooms')}</small>
                  </div>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="spec">
                  <span className="icon"><IconBath /></span>
                  <div>
                    <p>{property.bathrooms}</p>
                    <small>{t('properties.bathrooms')}</small>
                  </div>
                </div>
              )}
              {property.floor > 0 && (
                <div className="spec">
                  <span className="icon"><IconFloor /></span>
                  <div>
                    <p>{property.floor}</p>
                    <small>{t('form.floor')}</small>
                  </div>
                </div>
              )}
            </div>

            <div className="description-section">
              <h3>{t('form.description')}</h3>
              <p className="description-text">{localizedDescription}</p>
            </div>

            <div className="description-section">
              <Link to="/contact" className="btn btn-primary" style={{ display: 'inline-flex', justifyContent: 'center', width: '100%' }}>
                {t('property.contactForDetails')}
              </Link>
            </div>

            {user && (user.role === 'admin' || user.role === 'employee') && (
              <div className="admin-actions">
                <button className="btn btn-primary" onClick={() => navigate(`/dashboard?edit=${id}`)}>
                  {t('properties.edit')}
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  {t('properties.delete')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <div className="lightbox-overlay" onClick={() => setLightboxIndex(null)}>
          <button className="lightbox-close" onClick={() => setLightboxIndex(null)} aria-label="Close">×</button>
          {imageCount > 1 && (
            <button
              className="lightbox-prev"
              aria-label="Previous photo"
              onClick={e => { e.stopPropagation(); setLightboxIndex(i => (i - 1 + imageCount) % imageCount); }}
            >&#8249;</button>
          )}
          <img
            className="lightbox-img"
            src={propertyImages[lightboxIndex]}
            alt={`${property.title} ${lightboxIndex + 1}`}
            onClick={e => e.stopPropagation()}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_PROPERTY_IMAGE; }}
          />
          {imageCount > 1 && (
            <button
              className="lightbox-next"
              aria-label="Next photo"
              onClick={e => { e.stopPropagation(); setLightboxIndex(i => (i + 1) % imageCount); }}
            >&#8250;</button>
          )}
          <div className="lightbox-counter">{lightboxIndex + 1} / {imageCount}</div>
        </div>
      )}
    </div>
  );
}

export default PropertyDetail;

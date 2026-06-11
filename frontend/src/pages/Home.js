
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { propertyService } from '../services/api';
import { FALLBACK_PROPERTY_IMAGE, renderPrice, sortByNewest, safeImageSrc } from '../utils/propertyDisplay';
import '../styles/Home.css';

const IconHome = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>
);

const IconSliders = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
    <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
    <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/>
    <line x1="17" y1="16" x2="23" y2="16"/>
  </svg>
);

const IconUserCheck = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <polyline points="16 11 18 13 22 9"/>
  </svg>
);

const IconShield = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);


const IconVerified = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

const IconGlobe = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </svg>
);

const IconZap = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const IconMapPin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState({ city: '', type: '', maxPrice: '' });
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [featured, cityList] = await Promise.all([
          propertyService.getFeatured(),
          propertyService.getCities(),
        ]);
        if (featured.length > 0) {
          setFeaturedProperties(featured);
        } else {
          const all = await propertyService.getAll({});
          setFeaturedProperties(sortByNewest(all).slice(0, 3));
        }
        setCities(cityList);
      } catch (error) {
        setFeaturedProperties([]);
      }
    })();
  }, []);

  const resolveLocaleValue = (obj, geKey, enKey, ruKey) => {
    if (i18n.language === 'ka') return obj[geKey] || obj[enKey] || obj[ruKey] || '';
    if (i18n.language === 'ru') return obj[ruKey] || obj[enKey] || obj[geKey] || '';
    return obj[enKey] || obj[geKey] || obj[ruKey] || '';
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearch(prev => ({ ...prev, [name]: value }));
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.city) params.set('city', search.city);
    if (search.type) params.set('type', search.type);
    if (search.maxPrice) params.set('maxPrice', search.maxPrice);
    const queryString = params.toString();
    navigate('/properties' + (queryString ? '?' + queryString : ''));
  };

  const features = [
    { icon: <IconHome />, label: t('home.feature1') },
    { icon: <IconSliders />, label: t('home.feature2') },
    { icon: <IconUserCheck />, label: t('home.feature3') },
    { icon: <IconShield />, label: t('home.feature4') },
  ];

  const neighborhoods = [
    { nameKey: 'home.nbVakeName',       descKey: 'home.nbVakeDesc',       zone: 'Vake',       photo: 'https://images.unsplash.com/photo-1706466102829-8a34915cd235?auto=format&fit=crop&w=800&q=80' },
    { nameKey: 'home.nbOldTownName',    descKey: 'home.nbOldTownDesc',    zone: 'Ortachala',  photo: 'https://images.unsplash.com/photo-1542871549-b0fc1efbace7?auto=format&fit=crop&w=800&q=80' },
    { nameKey: 'home.nbMtatsmindaName', descKey: 'home.nbMtatsmindaDesc', zone: 'Mtatsminda', photo: 'https://images.unsplash.com/photo-1732882880909-ad7686aa85d2?auto=format&fit=crop&w=800&q=80' },
  ];

  const howSteps = [
    { n: '1', titleKey: 'home.how1Title', textKey: 'home.how1Text' },
    { n: '2', titleKey: 'home.how2Title', textKey: 'home.how2Text' },
    { n: '3', titleKey: 'home.how3Title', textKey: 'home.how3Text' },
  ];

  return (
    <div className="home luxury-home">

      <section className="minimal-hero">
        <div className="container">
          <div className="minimal-hero-content">
            <h1 className="luxury-title">{t('home.title')}</h1>
            <p className="hero-motto">{t('home.motto')}</p>
            <div className="hero-cta-row">
              <Link to="/properties" className="btn luxury-cta hero-browse-btn">{t('home.cta')}</Link>
              <Link to="/contact" className="btn luxury-cta luxury-cta-secondary">{t('home.contactAgent')}</Link>
            </div>
            <form className="hero-search-form" onSubmit={handleQuickSearch}>
              <select name="city" value={search.city} onChange={handleSearchChange}>
                <option value="">{t('home.searchCity')}</option>
                {cities.map(c => (
                  <option key={c.en} value={c.en}>
                    {resolveLocaleValue(c, 'ge', 'en', 'ru')}
                  </option>
                ))}
              </select>
              <select name="type" value={search.type} onChange={handleSearchChange}>
                <option value="">{t('home.searchRentOrSale')}</option>
                <option value="rent">{t('properties.rent')}</option>
                <option value="sale">{t('properties.sale')}</option>
              </select>
              <input
                type="number"
                name="maxPrice"
                placeholder={t('home.searchMaxBudget')}
                value={search.maxPrice}
                onChange={handleSearchChange}
              />
              <button type="submit" className="btn luxury-cta hero-search-btn">{t('common.search')}</button>
            </form>
          </div>
        </div>
      </section>

      <section className="minimal-features">
        <div className="container">
          <div className="feature-row">
            {features.map((f, i) => (
              <div key={i} className="feature-card minimal-feature">
                <span className="feature-icon">{f.icon}</span>
                <h3>{f.label}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-featured">
        <div className="container">
          <div className="section-heading">
            <h2>{t('home.featuredListings')}</h2>
            <Link to="/properties" className="section-view-all">{t('home.viewAll')}</Link>
          </div>
          <div className="featured-grid featured-grid--with-cta">
            {featuredProperties.map(property => (
              <article className="featured-card" key={property.id}>
                <div className="featured-image-wrap">
                  <img
                    src={safeImageSrc(property.image)}
                    alt={resolveLocaleValue(property, 'title', 'titleEn', 'titleRu')}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_PROPERTY_IMAGE; }}
                  />
                  <span className="featured-badge">
                    {property.type === 'rent' ? t('properties.rent') : t('properties.sale')}
                  </span>
                </div>
                <div className="featured-body">
                  <h3>{resolveLocaleValue(property, 'title', 'titleEn', 'titleRu')}</h3>
                  <p className="featured-location">
                    {resolveLocaleValue(property, 'city', 'cityEn', 'cityRu')}
                    {resolveLocaleValue(property, 'zone', 'zoneEn', 'zoneRu') ? `, ${resolveLocaleValue(property, 'zone', 'zoneEn', 'zoneRu')}` : ''}
                  </p>
                  <div className="featured-specs">
                    {property.bedrooms > 0 && <span>{property.bedrooms} {t('properties.bedrooms')}</span>}
                    {property.bathrooms > 0 && <span>{property.bathrooms} {t('properties.bathrooms')}</span>}
                    <span>{property.sqMeters} m²</span>
                  </div>
                  <div className="featured-footer">
                    <span className="featured-price">{renderPrice(property)}</span>
                    <Link to={`/properties/${property.id}`} className="featured-link">{t('properties.details')}</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="featured-mobile-cta">
            <Link to="/properties" className="btn luxury-cta">{t('home.viewAll')}</Link>
          </div>
        </div>
      </section>

      <section className="home-neighborhoods">
        <div className="container">
          <div className="section-heading">
            <h2>{t('home.neighborhoodsTitle')}</h2>
          </div>
          <div className="neighborhoods-grid">
            {neighborhoods.map((nb, i) => (
              <Link key={i} to={`/properties?city=Tbilisi&zone=${nb.zone}`} className="neighborhood-card">
                <span className="nb-bg" style={{ backgroundImage: `url(${nb.photo})` }} />
                <span className="nb-overlay" />
                <span className="nb-content">
                  <span className="nb-pin"><IconMapPin /></span>
                  <h3 className="nb-name">{t(nb.nameKey)}</h3>
                  <p className="nb-desc">{t(nb.descKey)}</p>
                  <span className="nb-cta">{t('home.viewNeighborhood')} →</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-trust">
        <div className="container">
          <div className="trust-cards">
            {[
              { icon: <IconVerified />, title: t('home.trust1Title'), sub: t('home.trust1Sub') },
              { icon: <IconGlobe />,    title: t('home.trust2Title'), sub: t('home.trust2Sub') },
              { icon: <IconZap />,      title: t('home.trust3Title'), sub: t('home.trust3Sub') },
            ].map((item, i) => (
              <div key={i} className="trust-card">
                <span className="trust-icon">{item.icon}</span>
                <strong className="trust-title">{item.title}</strong>
                <span className="trust-sub">{item.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-how">
        <div className="container">
          <h2 className="how-title">{t('home.howTitle')}</h2>
          <div className="how-grid">
            {howSteps.map((step, i) => (
              <div key={i} className="how-step">
                <span className="how-number">{step.n}</span>
                <h3 className="how-step-title">{t(step.titleKey)}</h3>
                <p className="how-step-text">{t(step.textKey)}</p>
                {i < howSteps.length - 1 && <span className="how-arrow" aria-hidden="true" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-contact-banner">
        <div className="container">
          <div className="contact-banner-inner">
            <div className="contact-banner-text">
              <h2>{t('home.helpTitle')}</h2>
              <p>{t('home.helpText')}</p>
            </div>
            <Link to="/contact" className="btn luxury-cta">{t('home.talkToAgent')}</Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;

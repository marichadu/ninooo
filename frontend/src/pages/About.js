
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/About.css';

const IconSearch = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

const IconHandshake = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);

const IconChart = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6"  y1="20" x2="6"  y2="14"/>
    <line x1="2"  y1="20" x2="22" y2="20"/>
  </svg>
);

function About() {
  const { t } = useTranslation();

  const services = [
    { id: 'listings', icon: <IconSearch />,    titleKey: 'about.service1Title', textKey: 'about.service1Text' },
    { id: 'support',  icon: <IconHandshake />, titleKey: 'about.service2Title', textKey: 'about.service2Text' },
    { id: 'insight',  icon: <IconChart />,     titleKey: 'about.service3Title', textKey: 'about.service3Text' },
  ];

  const values = [
    { id: 'discretion', n: '01', titleKey: 'about.value1', textKey: 'about.value1Text' },
    { id: 'integrity',  n: '02', titleKey: 'about.value2', textKey: 'about.value2Text' },
    { id: 'excellence', n: '03', titleKey: 'about.value3', textKey: 'about.value3Text' },
  ];

  return (
    <div className="about-page">

      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-inner">
            <span className="about-eyebrow">VESTA</span>
            <h1>{t('about.heroTitle')}</h1>
            <p className="about-hero-sub">{t('about.heroSub')}</p>
          </div>
        </div>
      </section>

      {/* ── Philosophy ── */}
      <section className="about-philosophy">
        <div className="container">
          <div className="philosophy-inner">
            <div className="philosophy-left">
              <h2>{t('about.philosophyTitle')}</h2>
              <p className="philosophy-quote">{t('about.philosophyLead')}</p>
            </div>
            <div className="philosophy-right">
              <p>{t('about.philosophyBody')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="about-services">
        <div className="container">
          <h2 className="about-section-title">{t('about.servicesTitle')}</h2>
          <div className="services-grid">
            {services.map((s) => (
              <div key={s.id} className="service-card">
                <span className="service-icon">{s.icon}</span>
                <h3>{t(s.titleKey)}</h3>
                <p>{t(s.textKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="about-values">
        <div className="container">
          <h2 className="about-section-title light">{t('about.valuesTitle')}</h2>
          <div className="values-grid">
            {values.map((v) => (
              <div key={v.id} className="value-card">
                <span className="value-number">{v.n}</span>
                <h3>{t(v.titleKey)}</h3>
                <p>{t(v.textKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta-section">
        <div className="container">
          <div className="about-cta-inner">
            <div className="about-cta-text">
              <h2>{t('about.ctaTitle')}</h2>
              <p>{t('about.ctaText')}</p>
            </div>
            <div className="about-cta-btns">
              <Link to="/properties" className="btn luxury-cta">{t('about.ctaBtn')}</Link>
              <Link to="/contact"    className="btn luxury-cta luxury-cta-secondary">{t('about.ctaContact')}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Address & Map ── */}
      <section className="about-address-section">
        <div className="container">
          <a
            href="https://maps.google.com/?q=23+Ushangi+Chkheidze+Street+Tbilisi+Georgia"
            target="_blank"
            rel="noreferrer"
            className="about-address-link"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            23 Ushangi Chkheidze Street, Tbilisi, Georgia
          </a>
          <div className="about-map">
            <iframe
              title="VESTA Office"
              src="https://maps.google.com/maps?q=23+Ushangi+Chkheidze+Tbilisi+Georgia&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="280"
              style={{ border: 0, borderRadius: '12px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

    </div>
  );
}

export default About;

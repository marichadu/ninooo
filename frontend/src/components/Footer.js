import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/Footer.css';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-inner">

          <div className="footer-brand">
            <div className="footer-logo">VESTA</div>
            <p className="footer-tagline">{t('footer.tagline')}</p>
            <div className="footer-socials">
              <a
                href="https://www.facebook.com/people/VESTA-REC/61583991054262/"
                target="_blank"
                rel="noreferrer"
                className="footer-social-link"
                aria-label="Facebook"
              >
                <img src="https://cdn.simpleicons.org/facebook/bfa45a" alt="" width="18" height="18" />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h5>{t('footer.company')}</h5>
            <Link to="/about">{t('nav.about')}</Link>
            <Link to="/contact">{t('nav.contact')}</Link>
          </div>

          <div className="footer-col">
            <h5>{t('footer.browse')}</h5>
            <Link to="/properties">{t('nav.properties')}</Link>
          </div>

          <div className="footer-col">
            <h5>{t('nav.contact')}</h5>
            <a href="mailto:vesta-rec@hotmail.com" className="footer-contact-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>
              vesta-rec@hotmail.com
            </a>
            <a href="tel:+995514279977" className="footer-contact-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.15a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              +995 514 27 99 77
            </a>
            <a
              href="https://maps.google.com/?q=23+Ushangi+Chkheidze+Street+Tbilisi+Georgia"
              target="_blank"
              rel="noreferrer"
              className="footer-contact-item footer-address"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              23 Ushangi Chkheidze St, Tbilisi
            </a>
          </div>

        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} VESTA. {t('footer.allRightsReserved')}</span>
        </div>
      </div>

      <div className="floating-social">
        <a className="social-btn whatsapp" href="https://wa.me/995514279977" target="_blank" rel="noreferrer" aria-label="WhatsApp">
          <img className="social-icon" src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="" aria-hidden="true" />
        </a>
        <a className="social-btn telegram" href="https://t.me/vestarec" target="_blank" rel="noreferrer" aria-label="Telegram">
          <img className="social-icon" src="https://cdn.simpleicons.org/telegram/ffffff" alt="" aria-hidden="true" />
        </a>
        <a className="social-btn viber" href="https://msng.link/o?995514279977=vi" target="_blank" rel="noreferrer" aria-label="Viber">
          <img className="social-icon" src="https://cdn.simpleicons.org/viber/ffffff" alt="" aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}

export default Footer;

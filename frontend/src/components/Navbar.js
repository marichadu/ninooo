
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/Navbar.css';

function Navbar({ isAuthenticated, user, onLogout, onLanguageChange }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [langDropdown, setLangDropdown] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    setMobileMenu(false);
    setLangDropdown(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/');
    setMobileMenu(false);
  };

  const languages = [
    { code: 'en', name: 'English',  label: '🇬🇧' },
    { code: 'ka', name: 'ქართული', label: '🇬🇪' },
    { code: 'ru', name: 'Русский',  label: '🇷🇺' },
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
  const isStaff = user?.role === 'admin' || user?.role === 'employee';

  return (
    <nav className="navbar">
      <div className="navbar-container">

        <Link to="/" className="navbar-logo" onClick={() => { setMobileMenu(false); setLangDropdown(false); }}>
          VESTA
        </Link>

        {/* Desktop nav links */}
        <ul className="navbar-menu">
          <li><Link to="/properties">{t('nav.properties')}</Link></li>
          <li><Link to="/about">{t('nav.about')}</Link></li>
          <li><Link to="/contact">{t('nav.contact')}</Link></li>
          {isAuthenticated && isStaff && (
            <li><Link to="/dashboard">{t('nav.dashboard')}</Link></li>
          )}
        </ul>

        {/* Right controls */}
        <div className="navbar-right">

          {/* Language flag button */}
          <div className="language-dropdown" ref={langRef}>
            <button className="lang-btn" onClick={() => setLangDropdown(!langDropdown)} aria-label="Change language">
              <span className="lang-flag">{currentLang.label}</span>
            </button>
            {langDropdown && (
              <div className="lang-menu">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    className={`lang-option ${i18n.language === lang.code ? 'active' : ''}`}
                    onClick={() => { onLanguageChange(lang.code); setLangDropdown(false); }}
                  >
                    <span className="lang-option-flag">{lang.label}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth button — desktop only, authenticated users only */}
          {isAuthenticated && (
            <button className="logout-btn nav-auth-btn" onClick={handleLogout}>
              {t('auth.logout')}
            </button>
          )}

          {/* Hamburger */}
          <button
            className={`navbar-toggle${mobileMenu ? ' open' : ''}`}
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>

        </div>
      </div>

      {/* Mobile slide-down menu */}
      <div className={`mobile-menu${mobileMenu ? ' open' : ''}`}>
        <Link to="/properties" onClick={() => setMobileMenu(false)}>{t('nav.properties')}</Link>
        <Link to="/about"      onClick={() => setMobileMenu(false)}>{t('nav.about')}</Link>
        <Link to="/contact"    onClick={() => setMobileMenu(false)}>{t('nav.contact')}</Link>
        {isAuthenticated && isStaff && (
          <Link to="/dashboard" onClick={() => setMobileMenu(false)}>{t('nav.dashboard')}</Link>
        )}
        {isAuthenticated && (
          <div className="mobile-menu-footer">
            <button className="mobile-auth-btn" onClick={handleLogout}>
              {t('auth.logout')} · {user?.name}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

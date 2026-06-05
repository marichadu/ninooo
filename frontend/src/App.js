import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n/config';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import About from './pages/About';
import Contact from './pages/Contact';
import './styles/App.css';
import { authService } from './services/api';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  const { i18n } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      setIsAuthenticated(true);
      setUser(authService.getUser());
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <Navbar
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
        onLanguageChange={changeLanguage}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to={user?.role === 'admin' || user?.role === 'employee' ? '/dashboard' : '/'} /> : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated && (user?.role === 'admin' || user?.role === 'employee') ? (
              <AdminPanel user={user} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/api';
import '../styles/Login.css';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      onLogin(response.user);
      const nextRoute = response.user?.role === 'admin' || response.user?.role === 'employee' ? '/dashboard' : '/';
      navigate(nextRoute);
    } catch (err) {
      setError(t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (e, creds) => {
    e.preventDefault();
    setEmail(creds.email);
    setPassword(creds.password);
    setTimeout(() => {
      setEmail(creds.email);
      setPassword(creds.password);
    }, 100);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{t('auth.login')}</h2>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@realestate.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth.password')}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-login" disabled={loading}>
            {loading ? t('common.loading') : t('auth.signin')}
          </button>
        </form>

        <div className="divider">OR</div>

        <div className="quick-login">
          <p>Test Accounts:</p>
          <button
            className="quick-btn admin"
            onClick={(e) =>
              handleQuickLogin(e, {
                email: 'admin@realestate.com',
                password: 'Admin123!'
              })
            }
          >
            👨‍💼 Admin
          </button>
          <button
            className="quick-btn employee"
            onClick={(e) =>
              handleQuickLogin(e, {
                email: 'employee@realestate.com',
                password: 'Employee123!'
              })
            }
          >
            👤 Employee
          </button>
        </div>

        <div className="info-box">
          <p>
            <strong>Demo Credentials:</strong>
          </p>
          <p>Admin: admin@realestate.com / Admin123!</p>
          <p>Employee: employee@realestate.com / Employee123!</p>
        </div>
      </div>
    </div>
  );
}

export default Login;

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/api';
import '../styles/Profile.css';

function Profile({ user }) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await authService.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (!profile) {
    return (
      <div className="container" style={{ marginTop: '40px' }}>
        <div className="error">{t('common.error')}</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="container">
        <h1>{t('profile.title')}</h1>

        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="profile-title">
              <h2>{profile.name}</h2>
              <p className="role-badge">
                {profile.role === 'admin' ? '👨‍💼 Admin' : '👤 Employee'}
              </p>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-row">
              <label>{t('profile.email')}:</label>
              <span>{profile.email}</span>
            </div>

            <div className="detail-row">
              <label>{t('profile.role')}:</label>
              <span className="role-text">
                {profile.role === 'admin' ? 'Administrator' : 'Employee'}
              </span>
            </div>

            <div className="detail-row">
              <label>{t('profile.joinDate')}:</label>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
}

export default Profile;

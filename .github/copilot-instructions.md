# Real Estate Platform - Development Guidelines

This document contains workspace-specific instructions for developing the Real Estate Platform.

## Project Overview

This is a full-stack real estate marketplace with:
- **Frontend**: React with multilingual support (Georgian, English, Russian)
- **Backend**: Node.js/Express REST API
- **Features**: Property listing, filtering, admin management, role-based access

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development**
   ```bash
   npm run dev
   ```

3. **Access Application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000/api

## Development Workflow

### File Structure
- `frontend/src/pages/` - Page components
- `frontend/src/components/` - Reusable UI components
- `frontend/src/services/` - API calls
- `frontend/src/i18n/` - Language translations
- `backend/routes/` - API endpoints
- `backend/middleware/` - Auth & validation

### Adding Features

#### New Property Filter
1. Update `backend/routes/properties.js` with filter logic
2. Update `frontend/src/pages/Properties.js` UI
3. Update translation keys in `frontend/src/i18n/config.js`

#### Adding Languages
1. Add new language object to `frontend/src/i18n/config.js`
2. Translate all keys in `i18n.resources`
3. Update language selector in `Navbar.js`

#### Backend Changes
- Edit API routes in `backend/routes/`
- Update mock data in `backend/mockData.js`
- Test with API client (Postman, Insomnia, etc.)

### Testing Login

**Admin User**
- Email: admin@realestate.com
- Password: Admin123!

**Employee User**
- Email: employee@realestate.com
- Password: Employee123!

## Code Standards

- Use functional components with hooks
- Keep components in `src/components/` or `src/pages/`
- CSS modules go in `src/styles/`
- API calls use `services/api.js`
- Use translation keys like `t('key.subkey')`

## Role Policy

- Admin and employee can perform the same property, analytics, and contact actions.
- Only admin can create employees (via `POST /api/auth/employees`).

## Important Notes

- Mock data stored in `backend/mockData.js` - replace with database when ready
- Images use external URLs - host your own for production
- JWT tokens stored in localStorage - consider more secure storage for production
- No actual email/SMS functionality - for demo purposes only

## Deployment Checklist

- [ ] Update JWT_SECRET in production
- [ ] Set NODE_ENV to production
- [ ] Use real database instead of mock data
- [ ] Host images on CDN
- [ ] Set up HTTPS
- [ ] Add rate limiting
- [ ] Implement proper error handling
- [ ] Add input validation
- [ ] Set up monitoring/logging

---

For detailed setup instructions, see INSTALLATION.md

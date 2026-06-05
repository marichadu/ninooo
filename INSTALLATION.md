# Real Estate Platform - Setup & Development Guide

Welcome to the Real Estate Platform! This is a full-stack application built with React and Node.js.

## 🚀 Quick Start

### Option 1: Install Dependencies & Run (Recommended)

```bash
# From the root directory, install all dependencies
npm install

# Run both frontend and backend in parallel
npm run dev
```

The application will open on:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### Option 2: Run Separately

```bash
# Terminal 1 - Backend
npm run backend

# Terminal 2 - Frontend
npm run frontend
```

## 📝 Test Credentials

### Admin Account (Full Access)
- **Email**: admin@realestate.com
- **Password**: Admin123!
- **Permissions**: Add, edit, delete properties; manage employees

### Employee Account
- **Email**: employee@realestate.com
- **Password**: Employee123!
- **Permissions**: Same property/analytics/contact actions as admin

## 🏗️ Project Structure

```
real-estate-platform/
├── frontend/                 # React Application
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── i18n/           # Internationalization
│   │   ├── styles/         # CSS files
│   │   └── App.js          # Main component
│   └── package.json
│
├── backend/                  # Node.js/Express Server
│   ├── middleware/          # Auth & request middleware
│   ├── routes/              # API route handlers
│   ├── utils/               # Helper functions
│   ├── mockData.js          # Sample data
│   ├── server.js            # Entry point
│   └── package.json
│
├── package.json             # Root workspace config
└── README.md

```

## 🌐 Languages Supported

- 🇬🇪 Georgian (ka)
- 🇬🇧 English (en)
- 🇷🇺 Russian (ru)

Switch languages using the language dropdown in the navigation bar!

## 📱 Features

### Landing Page
- Hero section with call-to-action
- Feature showcase
- Professional design

### Property Listing & Filtering
- Search by city, zone, type (rent/sale)
- Price and size range filters
- Multi-language property descriptions
- Detailed property views

### Admin Panel (Owner)
- ✅ Add new property listings
- ✅ Edit existing properties
- ✅ Delete properties
- ✅ View statistics (total, active, rent, sale)
- ✅ Manage multilingual content

### Employee Portal
- ✅ Add new property listings
- ✅ Edit existing properties
- ✅ Delete properties
- ✅ View analytics and contact messages

### User Management
- Role-based access control
- JWT authentication
- Secure logout

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout
- `POST /api/auth/employees` - Create employee (admin only)

### Properties (Public)
- `GET /api/properties` - Get all properties (with filters)
- `GET /api/properties/:id` - Get single property
- `GET /api/properties/cities` - Get list of cities
- `GET /api/properties/zones/:city` - Get zones in a city

### Properties (Protected)
- `POST /api/properties` - Create property (admin/employee)
- `PUT /api/properties/:id` - Update property (admin/employee)
- `DELETE /api/properties/:id` - Delete property (admin/employee)

## 🔐 Security Notes

- Passwords should be changed in production
- JWT secret should be updated in `.env`
- Add HTTPS in production
- Implement proper database instead of mock data
- Add rate limiting
- Validate all user inputs

## 🛠️ Available Commands

```bash
# From root directory
npm run dev           # Run frontend + backend
npm run frontend      # Run React only
npm run backend       # Run Node server only
npm run build         # Build frontend for production
npm install           # Install all dependencies
```

## 📦 Tech Stack

- **Frontend**: React 18, React Router, i18next, Axios
- **Backend**: Node.js, Express, JWT
- **Styling**: CSS3 with responsive design
- **Internationalization**: i18next for multi-language support

## 🎨 Customization

### Adding Properties
1. Login as admin (admin@realestate.com)
2. Go to Admin Panel
3. Click "Add New Listing"
4. Fill in property details in Georgian, English, and Russian
5. Submit the form

### Changing Images
Replace the `image` URL when adding/editing properties with your own image URLs.

## 📸 Using Web Images

Currently, the application uses images from Unsplash. To use your own images:
1. Host images on your server or use a CDN
2. Replace image URLs in property forms

## 🚨 Troubleshooting

### Port Already in Use
If port 3000 or 5000 is already in use:
```bash
# Change port in .env files
# Backend: BACKEND/.env
# Frontend: FRONTEND/.env
```

### CORS Issues
Make sure both services are running on the correct ports and the backend CORS is properly configured.

### Dependencies Not Installed
```bash
npm install
npm install -w frontend
npm install -w backend
```

## 📞 Support

For issues or questions, check the browser console and backend logs for error messages.

## 📄 License

MIT License - Feel free to use this project for your needs.

---

**Ready to start?** Run `npm install && npm run dev` and visit http://localhost:3000! 🎉

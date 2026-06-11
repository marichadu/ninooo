import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Service
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  createEmployee: async (payload) => {
    const response = await api.post('/auth/employees', payload);
    return response.data;
  },
  getEmployees: async () => {
    const response = await api.get('/auth/employees');
    return response.data;
  },
  deleteEmployee: async (id) => {
    const response = await api.delete(`/auth/employees/${id}`);
    return response.data;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// Property Service
export const propertyService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.city) params.append('city', filters.city);
    if (filters.zone) params.append('zone', filters.zone);
    if (filters.type) params.append('type', filters.type);
    if (filters.category) params.append('category', filters.category);
    if (filters.minSqMeters) params.append('minSqMeters', filters.minSqMeters);
    if (filters.maxSqMeters) params.append('maxSqMeters', filters.maxSqMeters);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.status) params.append('status', filters.status);

    const response = await api.get(`/properties?${params.toString()}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/properties', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/properties/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  },

  getFeatured: async () => {
    const response = await api.get('/properties/featured');
    return response.data;
  },

  getCities: async () => {
    const response = await api.get('/properties/cities');
    return response.data;
  },

  getZones: async (city) => {
    const response = await api.get(`/properties/zones/${city}`);
    return response.data;
  }
};

// Analytics Service
export const analyticsService = {
  getTransactions: async () => {
    const response = await api.get('/analytics/transactions');
    return response.data;
  },
  getSummary: async () => {
    const response = await api.get('/analytics/summary');
    return response.data;
  }
};

// Contact Service
export const contactService = {
  send: async (payload) => {
    const response = await api.post('/contact', payload);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/contact');
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/contact/${id}/status`, { status });
    return response.data;
  }
};

export default api;

import axios from 'axios';

// Base URL for all API calls
const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 0,
});

// Request interceptor - adds JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    if (token) {
      // Add Bearer token to Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 (unauthorized) globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401, token is expired or invalid - logout user
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

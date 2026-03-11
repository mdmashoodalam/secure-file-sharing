import api from './api';

// All authentication related API calls

const authService = {

  // Register a new user
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  // Login and save token to localStorage
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });

    if (response.data.success) {
      const { token, email: userEmail, name, role } = response.data.data;

      // Save token and user info to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ email: userEmail, name, role }));
    }

    return response.data;
  },

  // Logout - clear everything from localStorage
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },

  // Check if user is admin
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user && user.role === 'ROLE_ADMIN';
  },
};

export default authService;

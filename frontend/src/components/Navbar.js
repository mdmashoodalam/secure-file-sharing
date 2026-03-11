import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Main navigation bar shown at the top of every page
function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved preference
    return localStorage.getItem('darkMode') === 'true' || 
           window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Toggle dark mode
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (darkMode) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper to highlight active nav link
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🔒</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">SecureShare</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/dashboard" active={isActive('/dashboard')}>
              Dashboard
            </NavLink>
            <NavLink to="/my-files" active={isActive('/my-files')}>
              My Files
            </NavLink>
            <NavLink to="/shared" active={isActive('/shared')}>
              Shared with Me
            </NavLink>
            {/* Show admin link only for admins */}
            {isAdmin && (
              <NavLink to="/admin" active={isActive('/admin')}>
                Admin
              </NavLink>
            )}
          </div>

          {/* User menu */}
          <div className="flex items-center gap-3">
            {/* User info */}
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-300 font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">{user?.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}</p>
              </div>
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              Logout
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900">
            <MobileNavLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</MobileNavLink>
            <MobileNavLink to="/my-files" onClick={() => setMenuOpen(false)}>My Files</MobileNavLink>
            <MobileNavLink to="/shared" onClick={() => setMenuOpen(false)}>Shared with Me</MobileNavLink>
            {isAdmin && (
              <MobileNavLink to="/admin" onClick={() => setMenuOpen(false)}>Admin</MobileNavLink>
            )}
            {/* Mobile dark mode toggle */}
            <button
              onClick={() => {
                setDarkMode(!darkMode);
                setMenuOpen(false);
              }}
              className="w-full text-left block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm"
            >
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

// Desktop nav link component
function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
      }`}
    >
      {children}
    </Link>
  );
}

// Mobile nav link
function MobileNavLink({ to, onClick, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm"
    >
      {children}
    </Link>
  );
}

export default Navbar;

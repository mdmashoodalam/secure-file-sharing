import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OAuth2Success from './pages/OAuth2Success';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyFiles from './pages/MyFiles';
import SharedFiles from './pages/SharedFiles';

function AppContent() {
  const { isLoggedIn } = useAuth();

  // Initialize dark mode on app load
  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true' || 
                    window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/oauth2/success" element={<OAuth2Success />} />

          {/* Protected routes - need to be logged in */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-files"
            element={
              <ProtectedRoute>
                <MyFiles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shared"
            element={
              <ProtectedRoute>
                <SharedFiles />
              </ProtectedRoute>
            }
          />

          {/* Redirect root to dashboard or login based on auth status */}
          <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} />
        </Routes>

        {/* Toast notification container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

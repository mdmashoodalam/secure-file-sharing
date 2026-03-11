import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps protected pages - redirects to login if not authenticated
function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, isAdmin, loading } = useAuth();

  // Show nothing while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full spinner mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in, redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Admin-only page but user is not admin
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;

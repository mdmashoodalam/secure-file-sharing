import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Handles the redirect back from Google login
// URL will be: /oauth2/success?token=eyJhbG...&email=user@gmail.com
function OAuth2Success() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = () => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const loginError = searchParams.get('error');

    // Handle error from backend
    if (loginError) {
      setError('Google login failed. Please try again.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    // Check we got what we need
    if (!token || !email) {
      setError('Something went wrong. Missing login data.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    // Save token to localStorage — same as normal login
    localStorage.setItem('token', token);

    // We need to fetch user info to save name and role
    // Use the token we just got
    fetch('http://localhost:8080/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem('user', JSON.stringify({
          email: data.data.email,
          name: data.data.name,
          role: data.data.role
        }));
      } else {
        // Fallback: save what we have
        localStorage.setItem('user', JSON.stringify({
          email: email,
          name: email.split('@')[0],
          role: 'ROLE_USER'
        }));
      }
      // Go to dashboard
      navigate('/dashboard');
    })
    .catch(() => {
      // Fallback if /me fails
      localStorage.setItem('user', JSON.stringify({
        email: email,
        name: email.split('@')[0],
        role: 'ROLE_USER'
      }));
      navigate('/dashboard');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center w-full max-w-sm">
        {error ? (
          <>
            <div className="text-4xl mb-3">❌</div>
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-gray-400 text-sm mt-2">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent
              rounded-full animate-spin mx-auto mb-4">
            </div>
            <p className="text-gray-700 font-medium">Completing Google login...</p>
            <p className="text-gray-400 text-sm mt-1">Please wait</p>
          </>
        )}
      </div>
    </div>
  );
}

export default OAuth2Success;
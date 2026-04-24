import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  // isLoading is true during the initial verification of a stored token.
  // This prevents showing a previous user's data before the server confirms identity.
  const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem('token'));
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/auth', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        try {
          const response = await fetch('https://voultback.onrender.com/api/user/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch user profile, token might be invalid.');
          }
          const userData = await response.json();
          setUser(userData);
        } catch (error) {
          console.error("Session error:", error.message);
          logout();
        } finally {
          // Always mark loading as done once the check is complete.
          setIsLoading(false);
        }
      } else {
        setUser(null);
        setIsLoading(false);
      }
    };

    fetchUserProfile();

    // Listen for file changes across the app to update storage stats
    const handleFileChange = () => fetchUserProfile();
    window.addEventListener('fileChange', handleFileChange);

    return () => window.removeEventListener('fileChange', handleFileChange);
  }, [token, logout]);

  const login_success = () => {
    const storedToken = localStorage.getItem('token');
    // Mark as loading while we verify the new user's token.
    setIsLoading(true);
    // This will trigger the useEffect hook to run again and fetch the user profile.
    setToken(storedToken);
  }

  const refreshUser = async () => {
    if (token) {
      try {
        const response = await fetch('https://voultback.onrender.com/api/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to refresh user:", error);
      }
    }
  };

  const value = { user, token, isAuthenticated: !!token, isLoading, logout, login_success, refreshUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}


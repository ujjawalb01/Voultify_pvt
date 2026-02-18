import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/auth', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      // We use the token from the state, which is the single source of truth.
      if (token) {
        try {
          // IMPORTANT: Replace with your actual user profile endpoint
          const response = await fetch('http://localhost:3000/api/user/profile',
             {
            headers: { 'Authorization': `Bearer ${token}` }
          });


          if (!response.ok) {
            // This handles cases where the token is expired or invalid
            throw new Error('Failed to fetch user profile, token might be invalid.');
          }
          const userData = await response.json();
          setUser(userData);
        } catch (error) {
          console.error("Session error:", error.message);
          logout(); // Log out the user if the token is bad
        }
      } else {
        // If there's no token, ensure user is null.
        setUser(null);
      }
    };

    fetchUserProfile();
    // FIX: Added 'token' to the dependency array.
    // This makes the effect re-run whenever the token changes (e.g., after login).
  }, [token, logout]);

  const login_success = () => {
    const storedToken = localStorage.getItem('token');
    // This will trigger the useEffect hook to run again and fetch the user profile.
    setToken(storedToken);
  }

  const value = { user, token, isAuthenticated: !!token, logout, login_success };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}


// import React from 'react';
// import { Navigate } from 'react-router-dom';

// export default function ProtectedRoute({ isAuthenticated, children }) {
//   if (!isAuthenticated) {
//     // If the user is not authenticated, redirect them to the login page.
//     return <Navigate to="/auth" replace />;
//   }

//   // If the user is authenticated, render the page they were trying to access.
//   return children;
// }



import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * A component that protects routes from unauthenticated access.
 * Shows a loading state while the server is verifying the stored token,
 * so we never show a previous user's data to the current session.
 */
const ProtectedRoute = ({ isAuthenticated, children }) => {
  const { isLoading } = useAuth();

  // While verifying the token with the server, show nothing (or a spinner).
  // This prevents flashing the previous user's data.
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0b0616',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(106,17,203,0.2)',
          borderTop: '4px solid #6A11CB',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    // If the user is not authenticated, redirect them to the /auth page.
    return <Navigate to="/auth" replace />;
  }

  // If the user is authenticated, render the children components.
  return children;
};

export default ProtectedRoute;
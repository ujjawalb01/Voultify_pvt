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

/**
 * A component that protects routes from unauthenticated access.
 * @param {object} props - The component props.
 * @param {boolean} props.isAuthenticated - A boolean indicating if the user is logged in.
 * @param {React.ReactNode} props.children - The child components to render if authenticated.
 */
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    // If the user is not authenticated, redirect them to the /auth page.
    return <Navigate to="/auth" replace />;
  }

  // If the user is authenticated, render the children components.
  return children;
};

export default ProtectedRoute;
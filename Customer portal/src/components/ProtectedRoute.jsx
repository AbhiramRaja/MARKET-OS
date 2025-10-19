import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Navigate } from 'react-router-dom';

/**
 * Protected Route Component
 * Wraps routes that require authentication
 * Redirects to login if user is not authenticated
 */
export default function ProtectedRoute({ children, redirectTo = '/login' }) {
  const { user, authStatus } = useAuthenticator((context) => [context.user]);

  // Show loading while checking auth status
  if (authStatus === 'configuring') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render protected content
  return children;
}

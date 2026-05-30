import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, userData, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If we have a user but their dossier is incomplete, intercept and force onboarding
  if (userData?.onboardingComplete !== true) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default ProtectedRoute;

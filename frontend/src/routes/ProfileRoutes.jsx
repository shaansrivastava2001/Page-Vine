import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

import { isAuthenticated, clearSession } from '../utils/auth';

const ProfileRoutes = () => {
  if (isAuthenticated()) return <Outlet />;
  clearSession();
  return <Navigate to="/login" replace />;
};

export default ProfileRoutes;

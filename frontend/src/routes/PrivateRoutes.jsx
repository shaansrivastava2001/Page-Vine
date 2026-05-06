import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

import { isAuthenticated, clearSession } from '../utils/auth';

const PrivateRoutes = () => {
  if (isAuthenticated()) return <Outlet />;
  clearSession();
  return <Navigate to="/" replace />;
};

export default PrivateRoutes;

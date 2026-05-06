import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

import { isAuthenticated, clearSession } from '../utils/auth';

const ProtectLogin = () => {
  if (isAuthenticated()) return <Navigate to="/books" replace />;
  // Stale session — clean up so an expired userToken cookie doesn't stick around.
  clearSession();
  return <Outlet />;
};

export default ProtectLogin;

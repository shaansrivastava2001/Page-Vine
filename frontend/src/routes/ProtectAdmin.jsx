import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

import { isAuthenticated, getUser, clearSession } from '../utils/auth';

const ProtectAdmin = () => {
  if (!isAuthenticated()) {
    clearSession();
    return <Navigate to="/" replace />;
  }
  const user = getUser();
  if (user?.role !== "Admin") return <Navigate to="/books" replace />;
  return <Outlet />;
};

export default ProtectAdmin;

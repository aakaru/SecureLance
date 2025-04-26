import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
};

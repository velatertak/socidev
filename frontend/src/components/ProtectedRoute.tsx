import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredMode?: 'taskGiver' | 'taskDoer';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredMode }) => {
  const { isAuthenticated } = useAuth();
  const userMode = localStorage.getItem('userMode') as 'taskGiver' | 'taskDoer';
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredMode && userMode !== requiredMode) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
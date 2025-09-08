import { useAppSelector } from '../store';
import { UserRole } from '../types';

interface PermissionConfig {
  [key: string]: UserRole[];
}

const permissions: PermissionConfig = {
  'users.view': ['admin', 'manager', 'moderator', 'readonly'],
  'users.edit': ['admin', 'manager'],
  'users.delete': ['admin'],
  'orders.view': ['admin', 'manager', 'moderator', 'readonly'],
  'orders.edit': ['admin', 'manager'],
  'orders.refund': ['admin', 'manager'],
  'withdrawals.view': ['admin', 'manager', 'moderator'],
  'withdrawals.process': ['admin', 'manager'],
  'tasks.view': ['admin', 'manager', 'moderator', 'readonly'],
  'tasks.edit': ['admin', 'manager'],
  'devices.view': ['admin', 'manager', 'moderator'],
  'devices.edit': ['admin', 'manager'],
  'settings.view': ['admin'],
  'settings.edit': ['admin'],
  'analytics.view': ['admin', 'manager', 'readonly'],
};

export const usePermissions = () => {
  const user = useAppSelector(state => state.auth.user);
  
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    const allowedRoles = permissions[permission];
    if (!allowedRoles) return false;
    
    return allowedRoles.includes(user.role);
  };
  
  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some(permission => hasPermission(permission));
  };
  
  const hasAllPermissions = (permissionList: string[]): boolean => {
    return permissionList.every(permission => hasPermission(permission));
  };
  
  const canAccess = (resource: string, action: string = 'view'): boolean => {
    return hasPermission(`${resource}.${action}`);
  };
  
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    userRole: user?.role,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isModerator: user?.role === 'moderator',
    isReadonly: user?.role === 'readonly',
  };
};
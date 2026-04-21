import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredPermission,
  fallbackPath = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, loading, hasPermission, canAccessRoute } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Si se requiere un permiso específico, verificarlo
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Acceso Denegado</h1>
          <p className="text-slate-600">No tienes los permisos necesarios para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook para proteger rutas específicas
export function useRouteProtection(route: string) {
  const { canAccessRoute } = useAuth();
  
  return canAccessRoute(route);
}

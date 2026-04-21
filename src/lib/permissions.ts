// Sistema de permisos basado en roles

export type Role = 'master_admin' | 'admin' | 'user';

export interface Permission {
  dashboard: boolean;
  censo: boolean;
  cuotas: boolean;
  loterias: boolean;
  eventos: boolean;
  documentos: boolean;
  configuracion: boolean;
  users: boolean;
  roles: boolean;
}

// Definición de permisos por rol
export const ROLE_PERMISSIONS: Record<Role, Permission> = {
  master_admin: {
    dashboard: true,
    censo: true,
    cuotas: true,
    loterias: true,
    eventos: true,
    documentos: true,
    configuracion: true,
    users: true,
    roles: true,
  },
  admin: {
    dashboard: true,
    censo: true,
    cuotas: true,
    loterias: true,
    eventos: true,
    documentos: true,
    configuracion: true,
    users: true,
    roles: false,
  },
  user: {
    dashboard: true,
    censo: false,
    cuotas: false,
    loterias: false,
    eventos: false,
    documentos: true,
    configuracion: true,
    users: false,
    roles: false,
  },
};

// Función para verificar si un rol tiene un permiso específico
export function hasPermission(role: string | undefined, permission: keyof Permission): boolean {
  if (!role) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[role as Role];
  if (!rolePermissions) return false;
  
  return rolePermissions[permission];
}

// Función para verificar si un rol tiene acceso a una ruta
export function canAccessRoute(role: string | undefined, route: string): boolean {
  if (!role) return false;
  
  const routePermissions: Record<string, keyof Permission> = {
    '/dashboard': 'dashboard',
    '/censo': 'censo',
    '/cuotas': 'cuotas',
    '/loterias': 'loterias',
    '/eventos': 'eventos',
    '/documentos': 'documentos',
    '/configuracion': 'configuracion',
    '/configuracion/categorias': 'configuracion',
    '/configuracion/autenticacion': 'configuracion',
    '/configuracion/roles': 'roles',
  };
  
  const permission = routePermissions[route];
  if (!permission) return true; // Rutas públicas por defecto
  
  return hasPermission(role, permission);
}

// Función para obtener menús disponibles según rol
export function getMenuItems(role: string | undefined) {
  if (!role) return [];
  
  const permissions = ROLE_PERMISSIONS[role as Role];
  if (!permissions) return [];
  
  return [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: 'LayoutDashboard',
      visible: permissions.dashboard,
    },
    {
      title: 'Censo',
      path: '/censo',
      icon: 'Users',
      visible: permissions.censo,
    },
    {
      title: 'Cuotas',
      path: '/cuotas',
      icon: 'CreditCard',
      visible: permissions.cuotas,
    },
    {
      title: 'Loterías',
      path: '/loterias',
      icon: 'Ticket',
      visible: permissions.loterias,
    },
    {
      title: 'Eventos',
      path: '/eventos',
      icon: 'Calendar',
      visible: permissions.eventos,
    },
    {
      title: 'Documentos',
      path: '/documentos',
      icon: 'FileText',
      visible: permissions.documentos,
    },
    {
      title: 'Configuración',
      path: '/configuracion',
      icon: 'Settings',
      visible: permissions.configuracion,
    },
  ].filter(item => item.visible);
}

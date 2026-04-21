// Sistema de gestión de permisos avanzado
import { Role } from './permissions';

export interface SectionPermissions {
  // Permisos de visualización
  canView: boolean;
  
  // Permisos de creación
  canCreate: boolean;
  
  // Permisos de edición
  canEdit: boolean;
  
  // Permisos de eliminación
  canDelete: boolean;
  
  // Permisos de administración
  canManage: boolean;
}

export interface SectionConfig {
  id: string;
  name: string;
  description: string;
  permissions: Record<Role, SectionPermissions>;
}

// Configuración de secciones con permisos por rol
export const SECTIONS_CONFIG: Record<string, SectionConfig> = {
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Panel principal de la aplicación',
    permissions: {
      master_admin: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canManage: true
      },
      admin: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canManage: true
      },
      directiva: {
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      },
      delegado_loteria: {
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      },
      delegado_festejos: {
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      },
      fallero: {
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      }
    }
  },
  
  censo: {
    id: 'censo',
    name: 'Censo',
    description: 'Gestión de falleros y familias',
    permissions: {
      master_admin: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canManage: true
      },
      admin: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canManage: true
      },
      directiva: {
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      },
      delegado_loteria: {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      },
      delegado_festejos: {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      },
      fallero: {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      }
    }
  },
  
  cuotas: {
    id: 'cuotas',
    name: 'Cuotas',
    description: 'Gestión de cuotas y pagos',
    permissions: {
      master_admin: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canManage: true
      },
      admin: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canManage: true
      },
      directiva: {
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      },
      delegado_loteria: {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      },
      delegado_festejos: {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      },
      fallero: {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      }
    }
  },
  
  loterias: {
    id: 'loterias',
    name: 'Loterías',
    description: 'Gestión de loterías y sorteos',
    permissions: {
      master_admin: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canManage: true
      },
      admin: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canManage: true
      },
      directiva: {
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      },
      delegado_loteria: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canManage: false
      },
      delegado_festejos: {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      },
      fallero: {
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      }
    }
  },
  
  eventos: {
    id: 'eventos',
    name: 'Eventos',
    description: 'Gestión de eventos y festejos',
    permissions: {
      master_admin: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canManage: true
      },
      admin: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canManage: true
      },
      directiva: {
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      },
      delegado_loteria: {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      },
      delegado_festejos: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canManage: false
      },
      fallero: {
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      }
    }
  },
  
  documentos: {
    id: 'documentos',
    name: 'Documentos',
    description: 'Gestión de documentos y archivos',
    permissions: {
      master_admin: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canManage: true
      },
      admin: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canManage: true
      },
      directiva: {
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      },
      delegado_loteria: {
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      },
      delegado_festejos: {
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      },
      fallero: {
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      }
    }
  },
  
  configuracion: {
    id: 'configuracion',
    name: 'Configuración',
    description: 'Configuración del sistema',
    permissions: {
      master_admin: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canManage: true
      },
      admin: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canManage: true
      },
      directiva: {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      },
      delegado_loteria: {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      },
      delegado_festejos: {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      },
      fallero: {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false
      }
    }
  }
};

// Función para obtener permisos de una sección para un rol específico
export function getSectionPermissions(sectionId: string, role: string | undefined): SectionPermissions {
  if (!role) {
    return {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canManage: false
    };
  }
  
  const section = SECTIONS_CONFIG[sectionId];
  if (!section) {
    return {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canManage: false
    };
  }
  
  return section.permissions[role as Role] || {
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canManage: false
  };
}

// Función para verificar si un rol puede realizar una acción específica en una sección
export function canPerformAction(
  sectionId: string, 
  action: keyof SectionPermissions, 
  role: string | undefined
): boolean {
  const permissions = getSectionPermissions(sectionId, role);
  return permissions[action];
}

// Función para obtener todas las secciones que un rol puede ver
export function getVisibleSections(role: string | undefined): string[] {
  if (!role) return [];
  
  return Object.entries(SECTIONS_CONFIG)
    .filter(([_, section]) => section.permissions[role as Role]?.canView)
    .map(([sectionId]) => sectionId);
}

// Función para obtener todas las secciones que un rol puede administrar
export function getManageableSections(role: string | undefined): string[] {
  if (!role) return [];
  
  return Object.entries(SECTIONS_CONFIG)
    .filter(([_, section]) => section.permissions[role as Role]?.canManage)
    .map(([sectionId]) => sectionId);
}

import React, { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useSupabase } from '../../lib/SupabaseContext';
import { canPerformAction, getSectionPermissions, SECTIONS_CONFIG, SectionConfig } from '../../lib/permissionManager';
import { Role } from '../../lib/permissions';
import { CheckIcon, XMarkIcon, LockOpenIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface PermissionGridProps {
  sectionId: string;
  section: SectionConfig;
  userRole: Role;
  onPermissionChange?: (sectionId: string, role: Role, permission: string, value: boolean) => void;
  isEditable?: boolean;
}

function PermissionGrid({ sectionId, section, userRole, onPermissionChange, isEditable = false }: PermissionGridProps) {
  const { t } = useTranslation();
  const currentPermissions = getSectionPermissions(sectionId, userRole);

  const permissions = [
    { key: 'canView', label: 'Ver', icon: LockOpenIcon },
    { key: 'canCreate', label: 'Crear', icon: LockOpenIcon },
    { key: 'canEdit', label: 'Editar', icon: LockOpenIcon },
    { key: 'canDelete', label: 'Eliminar', icon: LockClosedIcon },
    { key: 'canManage', label: 'Administrar', icon: LockClosedIcon }
  ];

  const handlePermissionChange = (permissionKey: string, value: boolean) => {
    if (onPermissionChange && isEditable) {
      onPermissionChange(sectionId, userRole, permissionKey, value);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h3 className="text-lg font-semibold text-slate-800 mb-3">{section.name}</h3>
      <p className="text-sm text-slate-600 mb-4">{section.description}</p>
      
      <div className="grid grid-cols-5 gap-2">
        {permissions.map(({ key, label, icon: Icon }) => {
          const hasPermission = currentPermissions[key as keyof typeof currentPermissions];
          
          return (
            <div
              key={key}
              className={`
                flex flex-col items-center p-3 rounded-lg border transition-all
                ${hasPermission 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-red-50 border-red-200 text-red-700'
                }
                ${isEditable ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed opacity-75'}
              `}
              onClick={() => isEditable && handlePermissionChange(key, !hasPermission)}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{label}</span>
              {hasPermission ? (
                <CheckIcon className="w-4 h-4 mt-1" />
              ) : (
                <XMarkIcon className="w-4 h-4 mt-1" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PermissionManager() {
  const { t } = useTranslation();
  const { user } = useSupabase();
  const [selectedRole, setSelectedRole] = useState<Role>('master_admin');
  const [isEditing, setIsEditing] = useState(false);
  const [tempPermissions, setTempPermissions] = useState<Record<string, Record<Role, Record<string, boolean>>>>({});

  // Solo master_admin puede acceder a esta sección
  if (!user || user.role !== 'master_admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 text-center">
            <LockClosedIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-2">Acceso Restringido</h1>
            <p className="text-slate-600">Solo los Master Administradores pueden gestionar permisos.</p>
          </div>
        </div>
      </div>
    );
  }

  const roles: Role[] = ['master_admin', 'admin', 'directiva', 'delegado_loteria', 'delegado_festejos', 'fallero'];

  const handlePermissionChange = (sectionId: string, role: Role, permission: string, value: boolean) => {
    if (!isEditing) return;
    
    setTempPermissions(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [role]: {
          ...prev[sectionId]?.[role],
          [permission]: value
        }
      }
    }));
  };

  const startEditing = () => {
    setIsEditing(true);
    // Inicializar permisos temporales con los valores actuales
    const initialTemp: Record<string, Record<Role, Record<string, boolean>>> = {};
    Object.entries(SECTIONS_CONFIG).forEach(([sectionId, section]) => {
      initialTemp[sectionId] = {} as Record<Role, Record<string, boolean>>;
      roles.forEach(role => {
        initialTemp[sectionId][role] = {};
        Object.keys(section.permissions[role]).forEach(permission => {
          initialTemp[sectionId][role][permission] = section.permissions[role][permission as keyof typeof section.permissions[Role]];
        });
      });
    });
    setTempPermissions(initialTemp);
  };

  const saveChanges = () => {
    // TODO: Implementar guardado en base de datos
    console.log('Guardando permisos:', tempPermissions);
    setIsEditing(false);
    setTempPermissions({});
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setTempPermissions({});
  };

  const getRoleDisplayName = (role: Role): string => {
    const roleNames = {
      master_admin: 'Master Admin',
      admin: 'Administrador',
      directiva: 'Directiva',
      delegado_loteria: 'Delegado de Lotería',
      delegado_festejos: 'Delegado de Festejos',
      fallero: 'Fallero'
    };
    return roleNames[role];
  };

  const getRoleColor = (role: Role): string => {
    const roleColors = {
      master_admin: 'bg-purple-100 text-purple-800 border-purple-200',
      admin: 'bg-red-100 text-red-800 border-red-200',
      directiva: 'bg-blue-100 text-blue-800 border-blue-200',
      delegado_loteria: 'bg-green-100 text-green-800 border-green-200',
      delegado_festejos: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      fallero: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return roleColors[role];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Gestión de Permisos</h1>
              <p className="text-slate-600">Configura qué puede hacer cada rol en cada sección de la aplicación</p>
            </div>
            <div className="flex items-center space-x-4">
              {isEditing ? (
                <>
                  <button
                    onClick={cancelEditing}
                    className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveChanges}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    Guardar Cambios
                  </button>
                </>
              ) : (
                <button
                  onClick={startEditing}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Editar Permisos
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Rol */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <label className="block text-sm font-medium text-slate-700 mb-3">Seleccionar Rol:</label>
          <div className="flex flex-wrap gap-2">
            {roles.map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  selectedRole === role
                    ? getRoleColor(role)
                    : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
                }`}
              >
                {getRoleDisplayName(role)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de Permisos */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(SECTIONS_CONFIG).map(([sectionId, section]) => (
            <PermissionGrid
              sectionId={sectionId}
              section={section}
              userRole={selectedRole}
              onPermissionChange={handlePermissionChange}
              isEditable={isEditing}
              key={sectionId}
            />
          ))}
        </div>
      </div>

      {/* Información */}
      {isEditing && (
        <div className="max-w-6xl mx-auto mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <LockOpenIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-blue-800 mb-1">Modo de Edición</h3>
                <p className="text-sm text-blue-700">
                  Click en cualquier permiso para activarlo/desactivarlo. Los cambios se guardarán cuando hagas click en "Guardar Cambios".
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

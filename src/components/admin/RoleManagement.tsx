import React, { useState } from 'react';
import { useSupabase } from '../../lib/SupabaseContext';
import { useTranslation } from '../../lib/i18n';
import { User } from '../../types';

interface RoleManagementProps {
  user: User;
  onUpdate: () => void;
}

export function RoleManagement({ user, onUpdate }: RoleManagementProps) {
  const { updateUser } = useSupabase();
  const { t } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);

  // Determinar si el usuario actual puede gestionar roles
  const canManageRoles = user.role === 'master_admin' || 
                        (user.role === 'admin' && user.role !== 'master_admin');

  // Determinar si puede asignar roles específicos
  const canAssignRole = (targetRole: string): boolean => {
    if (user.role === 'master_admin') {
      return true; // Master puede asignar cualquier rol
    }
    
    if (user.role === 'admin') {
      // Admin solo puede asignar roles inferiores
      return ['admin', 'user'].includes(targetRole);
    }
    
    return false;
  };

  const handleRoleChange = async (newRole: string) => {
    if (!canAssignRole(newRole)) {
      alert('No tienes permisos para asignar este rol');
      return;
    }
    
    setIsChanging(true);
    try {
      await updateUser(user.id, {
        role: newRole,
        updated_at: new Date().toISOString()
      });
      
      onUpdate();
      setIsChanging(false);
    } catch (error) {
      console.error("Error updating user role:", error);
      alert('Error al actualizar rol. Revisa la consola para más detalles.');
    } finally {
      setIsChanging(false);
    }
  };

  const getRoleDisplayName = (role: string): string => {
    const roleNames = {
      'master_admin': 'Master Admin',
      'admin': 'Administrador',
      'user': 'Usuario'
    };
    return roleNames[role] || role;
  };

  const getRoleColor = (role: string): string => {
    const roleColors = {
      'master_admin': 'bg-purple-100 text-purple-800 border-purple-200',
      'admin': 'bg-red-100 text-red-800 border-red-200',
      'user': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (!canManageRoles) {
    return (
      <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {getRoleDisplayName(user.role)}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={user.role}
        onChange={(e) => handleRoleChange(e.target.value as string)}
        disabled={isChanging}
        className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-0 ${getRoleColor(user.role)}`}
      >
        <option value="user">Usuario</option>
        <option value="admin" disabled={!canAssignRole('admin')}>
          Administrador {user.role !== 'master_admin' && '(Solo Master)'}
        </option>
        {user.role === 'master_admin' && (
          <option value="master_admin">Master Admin</option>
        )}
      </select>
      
      {isChanging && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      )}
    </div>
  );
}

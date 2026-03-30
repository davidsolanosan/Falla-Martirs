import React, { useState } from 'react';
import { useData } from '../../lib/DataContext';
import { useTranslation } from '../../lib/i18n';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User, Role } from '../../types';

interface RoleManagementProps {
  user: User;
  onUpdate: () => void;
}

export function RoleManagement({ user, onUpdate }: RoleManagementProps) {
  const { currentUser } = useData();
  const { t } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);

  // Determinar si el usuario actual puede gestionar roles
  const canManageRoles = currentUser.role === 'master_admin' || 
                        (currentUser.role === 'admin' && user.role !== 'admin' && user.role !== 'master_admin');

  // Determinar si puede asignar roles específicos
  const canAssignRole = (targetRole: Role): boolean => {
    if (currentUser.role === 'master_admin') {
      return true; // Master puede asignar cualquier rol
    }
    
    if (currentUser.role === 'admin') {
      // Admin solo puede asignar roles inferiores
      return ['directiva', 'delegado_loteria', 'delegado_festejos', 'fallero'].includes(targetRole);
    }
    
    return false;
  };

  const handleRoleChange = async (newRole: Role) => {
    if (!canAssignRole(newRole)) {
      alert('No tienes permisos para asignar este rol');
      return;
    }

    setIsChanging(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        role: newRole,
        masterAdminId: currentUser.role === 'master_admin' ? currentUser.id : user.masterAdminId,
        updatedAt: new Date().toISOString()
      });

      // Registrar cambio en auditoría
      await addDoc(collection(db, 'role_audit_log'), {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        oldRole: user.role,
        newRole: newRole,
        changedBy: currentUser.id,
        changedByName: currentUser.name,
        timestamp: new Date(),
        action: currentUser.role === 'master_admin' ? 'master_assigned' : 'admin_assigned'
      });

      onUpdate();
      alert(`Rol de ${user.name} actualizado a ${getRoleDisplayName(newRole)}`);
    } catch (error) {
      console.error('Error changing role:', error);
      alert('Error al cambiar el rol. Revisa la consola.');
    } finally {
      setIsChanging(false);
    }
  };

  const getRoleDisplayName = (role: Role): string => {
    const roleNames = {
      'master_admin': 'Master Admin',
      'admin': 'Administrador',
      'directiva': 'Directiva',
      'delegado_loteria': 'Delegado de Lotería',
      'delegado_festejos': 'Delegado de Festejos',
      'fallero': 'Fallero'
    };
    return roleNames[role] || role;
  };

  const getRoleColor = (role: Role): string => {
    const roleColors = {
      'master_admin': 'bg-purple-100 text-purple-800 border-purple-200',
      'admin': 'bg-red-100 text-red-800 border-red-200',
      'directiva': 'bg-blue-100 text-blue-800 border-blue-200',
      'delegado_loteria': 'bg-green-100 text-green-800 border-green-200',
      'delegado_festejos': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'fallero': 'bg-gray-100 text-gray-800 border-gray-200'
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
        onChange={(e) => handleRoleChange(e.target.value as Role)}
        disabled={isChanging}
        className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-0 ${getRoleColor(user.role)}`}
      >
        <option value="fallero">Fallero</option>
        <option value="delegado_loteria">Delegado Lotería</option>
        <option value="delegado_festejos">Delegado Festejos</option>
        <option value="directiva">Directiva</option>
        <option value="admin" disabled={!canAssignRole('admin')}>
          Administrador {currentUser.role !== 'master_admin' && '(Solo Master)'}
        </option>
        {currentUser.role === 'master_admin' && (
          <option value="master_admin">Master Admin</option>
        )}
      </select>
      
      {isChanging && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      )}
    </div>
  );
}

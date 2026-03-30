import React, { useState, useEffect } from 'react';
import { useData } from '../../lib/DataContext';
import { doc, updateDoc, query, collection, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User, Role } from '../../types';

export function MasterAdminInit() {
  const { users, currentUser } = useData();
  const [isInitializing, setIsInitializing] = useState(false);
  const [masterEmail, setMasterEmail] = useState('');
  const [isSetup, setIsSetup] = useState(false);

  useEffect(() => {
    checkMasterAdminExists();
  }, []);

  const checkMasterAdminExists = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'master_admin'));
      const querySnapshot = await getDocs(q);
      setIsSetup(querySnapshot.empty);
    } catch (error) {
      console.error('Error checking master admin:', error);
    }
  };

  const handleCreateMasterAdmin = async () => {
    if (!masterEmail.trim()) {
      alert('Por favor, ingresa un email válido');
      return;
    }

    setIsInitializing(true);
    try {
      // Buscar si el usuario ya existe
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', masterEmail.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('No existe un usuario con ese email. Primero crea el usuario y luego asígnalo como Master Admin.');
        setIsInitializing(false);
        return;
      }

      // Actualizar el usuario existente a Master Admin
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as User;

      await updateDoc(doc(db, 'users', userDoc.id), {
        role: 'master_admin' as Role,
        masterAdminId: 'system_initialization',
        updatedAt: new Date().toISOString()
      });

      // Registrar en auditoría
      await addDoc(collection(db, 'role_audit_log'), {
        userId: userDoc.id,
        userName: userData.name,
        userEmail: userData.email,
        oldRole: userData.role,
        newRole: 'master_admin',
        changedBy: 'system',
        changedByName: 'System Initialization',
        timestamp: new Date(),
        action: 'system_master_assignment'
      });

      alert(`${userData.name} ha sido asignado como Master Admin exitosamente.`);
      setIsSetup(false);
      setMasterEmail('');
    } catch (error) {
      console.error('Error creating master admin:', error);
      alert('Error al asignar Master Admin. Revisa la consola.');
    } finally {
      setIsInitializing(false);
    }
  };

  // Solo mostrar si no hay master admin y el usuario actual es admin (para seguridad)
  if (!isSetup || currentUser.role !== 'admin') {
    return null;
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10 10V7a4 4 0 00-8 0v6a4 4 0 008 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-yellow-800">Configuración de Master Admin</h3>
            <p className="text-sm text-yellow-600">
              No hay ningún Master Admin configurado. Como administrador actual, puedes asignar el primer Master Admin.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-yellow-800 mb-2">
              Email del usuario a convertir en Master Admin:
            </label>
            <input
              type="email"
              value={masterEmail}
              onChange={(e) => setMasterEmail(e.target.value)}
              placeholder="admin@falla.com"
              className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              disabled={isInitializing}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCreateMasterAdmin}
              disabled={isInitializing || !masterEmail.trim()}
              className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isInitializing ? 'Asignando...' : 'Asignar Master Admin'}
            </button>
            <button
              onClick={() => setIsSetup(false)}
              className="px-4 py-2 border border-yellow-300 text-yellow-700 rounded-lg font-medium hover:bg-yellow-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
          <p className="text-xs text-yellow-700">
            <strong>⚠️ Advertencia de seguridad:</strong> El Master Admin tendrá control total sobre el sistema, 
            incluyendo la capacidad de asignar roles de administrador y modificar configuraciones críticas.
          </p>
        </div>
      </div>
    </div>
  );
}

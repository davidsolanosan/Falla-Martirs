import React, { useState, useEffect } from 'react';
import { useSupabase } from '../../lib/SupabaseContext';
import { User, Role } from '../../types';

export function MasterAdminInit() {
  const { user } = useSupabase();
  const [isInitializing, setIsInitializing] = useState(false);
  const [masterEmail, setMasterEmail] = useState('');
  const [isSetup, setIsSetup] = useState(false);

  useEffect(() => {
    checkMasterAdminExists();
  }, []);

  const checkMasterAdminExists = async () => {
    try {
      // TEMPORAL: No hay users en SupabaseContext, asumir que ya está configurado
      setIsSetup(false);
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
      // TEMPORAL: Solo mostrar mensaje de éxito
      alert(`Usuario ${masterEmail.trim()} asignado como Master Admin correctamente (funcionalidad temporal).`);
      setIsSetup(false);
      setMasterEmail('');
      
    } catch (error) {
      console.error('Error creating master admin:', error);
      alert('Error al crear Master Admin. Revisa la consola para más detalles.');
    } finally {
      setIsInitializing(false);
    }
  };

  // Solo mostrar si no hay master admin y el usuario actual es admin (para seguridad)
  if (!isSetup || user.role !== 'admin') {
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
              className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              disabled={isInitializing}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCreateMasterAdmin}
              disabled={isInitializing}
              className="w-full flex items-center justify-center bg-white text-[rgb(48,80,105)] border-3 border-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)] hover:text-white px-3 py-1.5 rounded-xl font-medium transition-all shadow-sm text-sm disabled:opacity-50"
            >
              {isInitializing ? 'Asignando...' : 'Asignar Master Admin'}
            </button>
            <button
              onClick={() => setIsSetup(false)}
              className="w-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-medium transition-colors shadow-sm text-sm"
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

import React, { useState } from 'react';
import { LoginModal } from '../components/auth/LoginModal';
import { useSupabase } from '../lib/SupabaseContext';
import { useAuth } from '../context/AuthContext';
import { Users, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const { user } = useAuth();
  const { initializeUserPasswords } = useSupabase();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showInitModal, setShowInitModal] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const [initMessage, setInitMessage] = useState('');

  const handleLoginSuccess = (loggedInUser: any) => {
    // El AuthContext manejará el estado del usuario
    console.log('Login exitoso:', loggedInUser);
  };

  const handleInitializePasswords = async () => {
    setInitLoading(true);
    setInitMessage('');
    
    try {
      await initializeUserPasswords();
      setInitMessage('¡Contraseñas inicializadas correctamente! Todos los usuarios ahora tienen first_login = true');
    } catch (error: any) {
      setInitMessage('Error: ' + error.message);
    } finally {
      setInitLoading(false);
    }
  };

  if (user) {
    // Si ya está logueado, redirigir al dashboard
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
            <Users className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Bienvenido, {user.name}!
            </h1>
            <p className="text-slate-600 mb-4">
              Ya estás logueado. Serás redirigido al dashboard...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="md:flex">
            {/* Panel izquierdo - Información */}
            <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">
              <div className="h-full flex flex-col justify-center">
                <div className="mb-8">
                  <Users className="h-16 w-16 mb-4" />
                  <h1 className="text-3xl font-bold mb-4">
                    Falla Martirs
                  </h1>
                  <p className="text-blue-100 mb-6">
                    Portal de gestión para falleros
                  </p>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold">1</span>
                    </div>
                    <p className="ml-3 text-blue-100">
                      Introduce tu email y contraseña inicial
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold">2</span>
                    </div>
                    <p className="ml-3 text-blue-100">
                      Si es tu primer acceso, cambia tu contraseña
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold">3</span>
                    </div>
                    <p className="ml-3 text-blue-100">
                      Accede a todas las funcionalidades
                    </p>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-blue-500 bg-opacity-30 rounded-lg">
                  <p className="text-sm font-medium mb-2">Contraseña inicial:</p>
                  <p className="text-xs text-blue-100">
                    Tu DNI + año de nacimiento
                  </p>
                  <p className="text-xs text-blue-100 mt-1">
                    Ejemplo: 12345678A1990
                  </p>
                </div>
              </div>
            </div>

            {/* Panel derecho - Login */}
            <div className="md:w-1/2 p-8">
              <div className="h-full flex flex-col justify-center">
                <div className="text-center mb-8">
                  <LogIn className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    Iniciar Sesión
                  </h2>
                  <p className="text-slate-600">
                    Accede al portal de falleros
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <LogIn className="h-5 w-5 mr-2" />
                    Iniciar Sesión
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-slate-500">Opciones de administración</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowInitModal(true)}
                    className="w-full bg-slate-100 text-slate-700 py-3 px-6 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
                  >
                    Inicializar Contraseñas (Admin)
                  </button>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-xs text-slate-500">
                    ¿Problemas con el acceso? Contacta con el administrador
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Login */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Modal de inicialización */}
      {showInitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Inicializar Contraseñas</h3>
            
            <div className="mb-4">
              <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div className="text-sm">
                  <p className="text-yellow-800 font-medium">Esta acción:</p>
                  <ul className="text-yellow-700 mt-1 space-y-1">
                    <li>• Establecerá first_login = true para todos los usuarios sin contraseña</li>
                    <li>• Permitirá que los usuarios usen su contraseña inicial (DNI + año)</li>
                    <li>• Forzará el cambio de contraseña en el primer login</li>
                  </ul>
                </div>
              </div>
            </div>

            {initMessage && (
              <div className={`mb-4 p-3 rounded-lg ${
                initMessage.includes('Error') 
                  ? 'bg-red-50 border border-red-200 text-red-700' 
                  : 'bg-green-50 border border-green-200 text-green-700'
              }`}>
                {initMessage}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowInitModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleInitializePasswords}
                disabled={initLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {initLoading ? 'Inicializando...' : 'Inicializar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

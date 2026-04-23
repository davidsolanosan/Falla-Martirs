/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SupabaseProvider } from './lib/SupabaseContext';
import { LanguageProvider } from './lib/i18n';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { RegisterScreen } from './components/auth/RegisterScreen';
import Layout from './components/LayoutSimple';
import Inici from './pages/Inici';
import Noticias from './pages/Noticias';
import Cuotas from './pages/Cuotas';
import Loterias from './pages/Loterias';
import LoteriasUser from './pages/LoteriasUser';
import Eventos from './pages/Eventos';
import Documentos from './pages/Documentos';
import Crear from './pages/Crear';
import Configuracion from './pages/Configuracion';
import PermissionManager from './components/admin/PermissionManager';

// Import de páginas de administración
import InicioAdmin from './pages/administracion/InicioAdmin';
import Censo from './pages/Censo';
import NoticiasAdmin from './pages/administracion/NoticiasAdmin';
import EventosAdmin from './pages/administracion/EventosAdmin';
import CuotasAdmin from './pages/administracion/CuotasAdmin';
import LoteriasAdmin from './pages/LoteriasAdmin';
import DocumentosAdmin from './pages/administracion/DocumentosAdmin';
import CrearAdmin from './pages/administracion/CrearAdmin';
import ConfiguracionAdmin from './pages/administracion/ConfiguracionAdmin';
import ChangePassword from './pages/ChangePassword';
import ResetPassword from './pages/ResetPassword';

// Componente para rutas protegidas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Importar useAuth dentro del componente
function AppWithAuth() {
  return (
    <LanguageProvider>
      <SupabaseProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/register" element={<RegisterScreen />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              
              {/* Rutas protegidas */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Inici />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/noticias" element={
                <ProtectedRoute>
                  <Layout>
                    <Noticias />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/cuotas" element={
                <ProtectedRoute>
                  <Layout>
                    <Cuotas />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/loterias" element={
                <ProtectedRoute>
                  <Layout>
                    <LoteriasUser />
                  </Layout>
                </ProtectedRoute>
              } />
              
                            
                            
              <Route path="/configuracion/permisos" element={
                <ProtectedRoute>
                  <Layout>
                    <PermissionManager />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/eventos" element={
                <ProtectedRoute>
                  <Layout>
                    <Eventos />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/documentos" element={
                <ProtectedRoute>
                  <Layout>
                    <Documentos />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/crear" element={
                <ProtectedRoute>
                  <Layout>
                    <Crear />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/configuracion" element={
                <ProtectedRoute>
                  <Layout>
                    <Configuracion />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Rutas de Administración */}
              <Route path="/administracion/inicio" element={
                <ProtectedRoute>
                  <Layout>
                    <InicioAdmin />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/administracion/censo" element={
                <ProtectedRoute>
                  <Layout>
                    <Censo />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/administracion/noticias" element={
                <ProtectedRoute>
                  <Layout>
                    <NoticiasAdmin />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/administracion/eventos" element={
                <ProtectedRoute>
                  <Layout>
                    <EventosAdmin />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/administracion/cuotas" element={
                <ProtectedRoute>
                  <Layout>
                    <CuotasAdmin />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/administracion/loterias" element={
                <ProtectedRoute>
                  <Layout>
                    <LoteriasAdmin />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/administracion/documentos" element={
                <ProtectedRoute>
                  <Layout>
                    <DocumentosAdmin />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/administracion/crear" element={
                <ProtectedRoute>
                  <Layout>
                    <CrearAdmin />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/administracion/configuracion" element={
                <ProtectedRoute>
                  <Layout>
                    <ConfiguracionAdmin />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Ruta de cambio de contraseña (sin Layout) */}
              <Route path="/change-password" element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              } />
              
              {/* Redirección por defecto */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </SupabaseProvider>
    </LanguageProvider>
  );
}

export default function App() {
  return <AppWithAuth />;
}

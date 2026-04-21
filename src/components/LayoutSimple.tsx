import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, CreditCard, Ticket, CalendarDays, FileText, Settings, Menu, X, Globe, Shield, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useSupabase } from '../lib/SupabaseContext';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../lib/permissions';
import { useTranslation } from '../lib/i18n';

const getNavItems = (role: string | undefined, t: any) => {
  const items = [];
  
  // Inicio (Dashboard)
  if (hasPermission(role, 'dashboard')) {
    items.push({ 
      name: t('navHome'), 
      path: '/', 
      icon: Home 
    });
  }
  
  // Noticias (visual para todos)
  if (hasPermission(role, 'dashboard')) {
    items.push({ 
      name: t('navNews'), 
      path: '/noticias', 
      icon: FileText 
    });
  }
  
  // Eventos (visual para todos)
  if (hasPermission(role, 'dashboard')) {
    items.push({ 
      name: t('navEvents'), 
      path: '/eventos', 
      icon: CalendarDays 
    });
  }
  
  // Cuotas (visual para todos)
  if (hasPermission(role, 'dashboard')) {
    items.push({ 
      name: role === 'user' ? t('navMyQuotas') : t('navQuotas'), 
      path: '/cuotas', 
      icon: CreditCard 
    });
  }
  
  // Loterías (visual para todos)
  if (hasPermission(role, 'dashboard')) {
    items.push({ 
      name: role === 'user' ? t('navMyLottery') : t('navLottery'), 
      path: '/loterias', 
      icon: Ticket 
    });
  }
  
  // Documentos (visual para todos)
  if (hasPermission(role, 'dashboard')) {
    items.push({ 
      name: t('navDocuments'), 
      path: '/documentos', 
      icon: FileText 
    });
  }
  
  // Crear (visual para todos)
  if (hasPermission(role, 'dashboard')) {
    items.push({ 
      name: t('navCreate'), 
      path: '/crear', 
      icon: Plus 
    });
  }
  
  // Configuración (para todos)
  if (hasPermission(role, 'configuracion')) {
    items.push({ 
      name: t('navSettings'), 
      path: '/configuracion', 
      icon: Settings 
    });
  }
  
  // Administración (solo para admin y master_admin)
  if (role === 'admin' || role === 'master_admin') {
    items.push({ 
      name: t('navAdministration'), 
      path: '/administracion', 
      icon: Shield,
      isAdmin: true,
      subItems: [
        { name: t('navAdminDashboard'), path: '/administracion/inicio', icon: Home },
        { name: t('navAdminCensus'), path: '/administracion/censo', icon: Users },
        { name: t('navAdminNews'), path: '/administracion/noticias', icon: FileText },
        { name: t('navAdminEvents'), path: '/administracion/eventos', icon: CalendarDays },
        { name: t('navAdminQuotas'), path: '/administracion/cuotas', icon: CreditCard },
        { name: t('navAdminLottery'), path: '/administracion/loterias', icon: Ticket },
        { name: t('navAdminDocuments'), path: '/administracion/documentos', icon: FileText },
        { name: t('navAdminCreate'), path: '/administracion/crear', icon: Plus },
        { name: t('navAdminSettings'), path: '/administracion/configuracion', icon: Settings }
      ]
    });
  }
  
  return items;
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { user: supabaseUser } = useSupabase(); // Para datos adicionales si es necesario
  const { t, language, setLanguage } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  
  const navItems = getNavItems(user?.role || 'user', t);
  
  // Debug para ver qué está pasando
  console.log('🔍 LayoutSimple - User:', user);
  console.log('🔍 LayoutSimple - Role:', user?.role);
  console.log('🔍 LayoutSimple - NavItems:', navItems);
  console.log('🔍 LayoutSimple - hasPermission censo:', hasPermission(user?.role, 'censo'));
  console.log('🔍 LayoutSimple - hasPermission configuracion:', hasPermission(user?.role, 'configuracion'));

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shadow-sm z-30">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{t('appTitle')}</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isAdminItem = item.isAdmin;
            
            if (isAdminItem) {
              return (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                    className={`w-full flex items-center px-2 py-1.5 text-sm font-medium rounded-xl transition-colors ${
                      location.pathname.startsWith('/administracion')
                        ? "bg-slate-100 text-slate-800" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.name}
                    {isAdminMenuOpen ? (
                      <ChevronDown className="w-4 h-4 ml-auto" />
                    ) : (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                  
                  {isAdminMenuOpen && item.subItems && (
                    <div className="ml-4 space-y-1">
                      {item.subItems.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isSubActive = location.pathname === subItem.path;
                        return (
                          <Link
                            key={subItem.name}
                            to={subItem.path}
                            className={`flex items-center px-2 py-1.5 text-sm font-medium rounded-xl transition-colors ${
                              isSubActive 
                                ? "bg-blue-50 text-blue-700" 
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                            }`}
                          >
                            <SubIcon className="w-4 h-4 mr-3" />
                            {subItem.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-2 py-1.5 text-sm font-medium rounded-xl transition-colors ${
                  isActive 
                    ? "bg-slate-100 text-slate-800" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mb-3">
            <Globe className="w-4 h-4 text-slate-400" />
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="va">🇪🇸 Valencià</option>
              <option value="es">🇪🇸 Castellano</option>
            </select>
          </div>
          
          <button
            onClick={() => logout()}
            className="w-full text-xs text-slate-600 hover:text-slate-900 font-medium px-2 py-1.5"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1600px] w-full mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-md border border-slate-200"
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50" style={{ backgroundColor: 'rgba(71, 85, 105, 0.4)' }} onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed left-0 top-0 h-full w-64 bg-white bg-opacity-95 shadow-xl">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-indigo-600">{t('appTitle')}</h2>
            </div>
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center p-3 rounded-xl border border-slate-100 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Icon className="w-5 h-5 mr-2 text-slate-400" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

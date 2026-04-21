import React from 'react';
import { useTranslation } from '../lib/i18n';
import { useSupabase } from '../lib/SupabaseContext';
import { 
  Home, 
  Users, 
  Calendar, 
  Settings, 
  FileText, 
  CreditCard,
  Gift
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();
  const { user } = useSupabase();
  const [activeNav, setActiveNav] = React.useState('censo');

  const isAdmin = user ? (user.role === 'admin' || user.role === 'master_admin') : false;

  const navigation = [
    { id: 'censo', name: t('navCensus'), icon: Users, href: '/censo' },
    { id: 'cuotas', name: t('navQuotas'), icon: CreditCard, href: '/cuotas' },
    { id: 'eventos', name: t('navEvents'), icon: Calendar, href: '/eventos' },
    { id: 'loterias', name: 'Loterías', icon: Gift, href: '/loterias' },
  ];

  const adminNavigation = [
    { id: 'configuracion', name: t('navSettings'), icon: Settings, href: '/configuracion' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-slate-200">
            <h1 className="text-xl font-bold text-slate-800">Falla Martirs</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveNav(item.id);
                    // Aquí podrías usar un router para navegar
                    window.location.href = item.href;
                  }}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeNav === item.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </a>
              );
            })}

            {/* Admin navigation */}
            {isAdmin && (
              <div className="pt-4 mt-4 border-t border-slate-200">
                <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Administración
                </p>
                <div className="mt-3 space-y-2">
                  {adminNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.id}
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveNav(item.id);
                          window.location.href = item.href;
                        }}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          activeNav === item.id
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-900">
                  {user?.name || 'Usuario'}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.role || 'Invitado'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
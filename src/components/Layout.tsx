import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, CreditCard, Ticket, CalendarDays, FileText, Settings, Menu, X, Globe } from 'lucide-react';
import { useData } from '../lib/DataContext';
import { useTranslation } from '../lib/i18n';
import { cn } from '../lib/utils';
import { LoginScreen } from './auth/LoginScreen';

const getNavItems = (role: string, t: any) => {
  const isAdmin = role === 'admin' || role === 'directiva';
  return [
    { name: isAdmin ? t('navSummary') : t('navMySummary'), path: '/', icon: Home },
    { name: isAdmin ? t('navCensus') : t('navMyFamily'), path: '/censo', icon: Users },
    { name: isAdmin ? t('navQuotas') : t('navMyQuotas'), path: '/cuotas', icon: CreditCard },
    { name: isAdmin ? t('navLottery') : t('navMyLottery'), path: '/loteria', icon: Ticket },
    { name: t('navEvents'), path: '/eventos', icon: CalendarDays },
    { name: t('navDocs'), path: '/documentos', icon: FileText },
    ...(isAdmin ? [{ name: t('navSettings'), path: '/configuracion', icon: Settings }] : []),
  ];
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { currentUser, signIn, signOut, isAuthReady } = useData();
  const { t, language, setLanguage } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  if (!isAuthReady) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  const navItems = getNavItems(currentUser.role, t);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shadow-sm z-30">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">{t('appTitle')}</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors",
                  isActive 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-indigo-600" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
              {currentUser.name.charAt(0)}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-slate-700">{currentUser.name}</p>
              <p className="text-xs text-slate-500 capitalize">{currentUser.role.replace('_', ' ')}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <button 
              onClick={signOut}
              className="text-xs py-1.5 px-2 rounded-md border transition-colors bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cerrar Sesión
            </button>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500 flex items-center"><Globe className="w-3 h-3 mr-1"/> Idioma</span>
              <div className="flex bg-slate-100 rounded-md p-0.5">
                <button onClick={() => setLanguage('va')} className={cn("text-[10px] px-2 py-1 rounded-sm font-medium", language === 'va' ? "bg-white shadow-sm text-indigo-600" : "text-slate-500")}>VA</button>
                <button onClick={() => setLanguage('es')} className={cn("text-[10px] px-2 py-1 rounded-sm font-medium", language === 'es' ? "bg-white shadow-sm text-indigo-600" : "text-slate-500")}>ES</button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 relative z-30">
          <h1 className="text-xl font-bold text-indigo-600">{t('appTitle')}</h1>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute inset-0 z-20 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
            <div 
              className="absolute top-[73px] left-0 right-0 bg-white border-b border-slate-200 shadow-xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-2" 
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase text-lg">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{currentUser.role.replace('_', ' ')}</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                  className="flex-1 text-xs py-2.5 px-2 rounded-xl border font-medium transition-colors bg-white border-slate-200 text-slate-600"
                >
                  Cerrar Sesión
                </button>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium flex items-center"><Globe className="w-4 h-4 mr-2"/> Idioma</span>
                <div className="flex bg-slate-200/50 rounded-lg p-1">
                  <button onClick={() => setLanguage('va')} className={cn("text-xs px-3 py-1.5 rounded-md font-medium transition-all", language === 'va' ? "bg-white shadow-sm text-indigo-600" : "text-slate-500")}>Valencià</button>
                  <button onClick={() => setLanguage('es')} className={cn("text-xs px-3 py-1.5 rounded-md font-medium transition-all", language === 'es' ? "bg-white shadow-sm text-indigo-600" : "text-slate-500")}>Castellano</button>
                </div>
              </div>

              {navItems.length > 5 && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('moreOptions')}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {navItems.slice(5).map(item => {
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
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-[1600px] w-full mx-auto pb-20 md:pb-0">
            {children}
          </div>
        </div>

        {/* Bottom Navigation (Mobile) */}
        <nav className="md:hidden absolute bottom-0 left-0 right-0 flex items-center justify-around bg-white border-t border-slate-200 pb-safe z-10">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex flex-col items-center p-3 min-w-[64px]",
                  isActive ? "text-indigo-600" : "text-slate-500"
                )}
              >
                <Icon className={cn("h-6 w-6 mb-1", isActive ? "fill-indigo-50" : "")} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}

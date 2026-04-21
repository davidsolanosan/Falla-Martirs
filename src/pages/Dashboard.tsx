import React from 'react';
import { useSupabase } from '../lib/SupabaseContext';
import { useTranslation } from '../lib/i18n';
import { Users, CreditCard, Ticket, CalendarDays } from 'lucide-react';

export default function Dashboard() {
  const { families, categories, user, users } = useSupabase();
  const { t } = useTranslation();
  
  // Si no hay usuario, mostrar mensaje de carga o login
  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Cargando usuario...</h2>
        <p>Por favor, inicia sesión para ver el dashboard.</p>
      </div>
    );
  }
  
  const isAdmin = user.role === 'admin' || user.role === 'master_admin';

  const stats = isAdmin ? [
    { name: t('totalFalleros'), value: users.length, icon: Users, color: 'bg-slate-600' },
    { name: t('families'), value: families.length, icon: Users, color: 'bg-slate-700' },
    { name: t('categories'), value: categories.length, icon: CreditCard, color: 'bg-slate-600' },
    { name: t('activeLottery'), value: 0, icon: Ticket, color: 'bg-slate-500' },
  ] : [
    { name: t('familyMembers'), value: 0, icon: Users, color: 'bg-slate-600' },
    { name: t('nextEvents'), value: 0, icon: CalendarDays, color: 'bg-slate-600' },
    { name: t('activeLotteries'), value: 0, icon: Ticket, color: 'bg-slate-500' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{isAdmin ? t('generalSummary') : t('navMySummary')}</h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-start">
              <div className={`p-3 rounded-2xl ${stat.color} bg-opacity-10 mb-4`}>
                <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">{stat.name}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Próximos Eventos */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">{t('nextEvents')}</h3>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">{t('seeAll')}</button>
          </div>
          <div className="space-y-4">
            <p className="text-center text-slate-500 py-8">🎫 {t('noActiveEvents')}</p>
          </div>
        </div>

        {/* Estado Lotería - Simplificado */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">{isAdmin ? t('lotteryStatus') : t('navMyLottery')}</h3>
            {isAdmin && <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">{t('manage')}</button>}
          </div>
          <div className="text-center py-8 text-slate-500">
            <p className="text-lg font-medium mb-2">🎫</p>
            <p>{t('noActiveLotteries')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

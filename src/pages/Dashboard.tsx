import React from 'react';
import { useData } from '../lib/DataContext';
import { useTranslation } from '../lib/i18n';
import { Users, CreditCard, Ticket, CalendarDays } from 'lucide-react';

export default function Dashboard() {
  const { users, families, events, lotteries, currentUser } = useData();
  const { t } = useTranslation();
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'directiva';

  const stats = isAdmin ? [
    { name: t('totalFalleros'), value: users.length, icon: Users, color: 'bg-blue-500' },
    { name: t('families'), value: families.length, icon: Users, color: 'bg-indigo-500' },
    { name: t('nextEvents'), value: events.length, icon: CalendarDays, color: 'bg-emerald-500' },
    { name: t('activeLottery'), value: lotteries.length, icon: Ticket, color: 'bg-amber-500' },
  ] : [
    { name: t('familyMembers'), value: families.find(f => f.id === currentUser.familyId)?.members.length || 0, icon: Users, color: 'bg-blue-500' },
    { name: t('nextEvents'), value: events.length, icon: CalendarDays, color: 'bg-emerald-500' },
    { name: t('activeLotteries'), value: lotteries.length, icon: Ticket, color: 'bg-amber-500' },
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
            {events.map(event => (
              <div key={event.id} className="flex items-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="bg-white p-3 rounded-xl shadow-sm mr-4 text-center min-w-[60px]">
                  <p className="text-xs font-bold text-slate-500 uppercase">{new Date(event.date).toLocaleString('es-ES', { month: 'short' })}</p>
                  <p className="text-xl font-bold text-indigo-600">{new Date(event.date).getDate()}</p>
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-slate-800">{event.title}</h4>
                  <p className="text-sm text-slate-500 line-clamp-1">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estado Lotería */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">{isAdmin ? t('lotteryStatus') : t('navMyLottery')}</h3>
            {isAdmin && <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">{t('manage')}</button>}
          </div>
          {lotteries.map(lottery => {
            const totalAssigned = isAdmin 
              ? Object.values(lottery.assignedToFamily).reduce((a: number, b: number) => a + b, 0) as number
              : (currentUser.familyId ? (lottery.assignedToFamily[currentUser.familyId] || 0) : 0);
            const totalSold = isAdmin
              ? Object.values(lottery.soldByFamily).reduce((a: number, b: number) => a + b, 0) as number
              : (currentUser.familyId ? (lottery.soldByFamily[currentUser.familyId] || 0) : 0);
            const progress = totalAssigned > 0 ? Math.round((totalSold / totalAssigned) * 100) : 0;

            return (
              <div key={lottery.id} className="mb-4 last:mb-0">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h4 className="text-base font-bold text-slate-800">{lottery.name}</h4>
                    <p className="text-sm text-slate-500">{totalSold} {t('of')} {totalAssigned} {t('sold')}</p>
                  </div>
                  <span className="text-lg font-bold text-indigo-600">{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="bg-indigo-500 h-3 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

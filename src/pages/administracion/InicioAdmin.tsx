import React from 'react';
import { useTranslation } from '../../lib/i18n';
import { useSupabase } from '../../lib/SupabaseContext';
import { hasPermission } from '../../lib/permissions';
import { BarChart3, Users, TrendingUp, Calendar, CreditCard, FileText, Ticket, Plus, Settings } from 'lucide-react';

export default function InicioAdmin() {
  const { t } = useTranslation();
  const { users, families } = useSupabase();
  
  // Calcular estadísticas
  const totalUsers = users?.length || 0;
  const totalFamilies = families?.length || 0;
  const activeUsers = users?.filter(u => u.last_login) || [];
  
  const stats = [
    {
      name: t('totalUsers'),
      value: totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      name: t('totalFamilies'),
      value: totalFamilies,
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-100'
    },
    {
      name: t('activeUsers'),
      value: activeUsers.length,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100'
    },
    {
      name: t('totalSections'),
      value: 8,
      icon: BarChart3,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100'
    }
  ];

  const sections = [
    { name: t('navAdminCensus'), path: '/administracion/censo', icon: Users, count: totalUsers },
    { name: t('navAdminNews'), path: '/administracion/noticias', icon: FileText, count: 0 },
    { name: t('navAdminEvents'), path: '/administracion/eventos', icon: Calendar, count: 0 },
    { name: t('navAdminQuotas'), path: '/administracion/cuotas', icon: CreditCard, count: totalFamilies },
    { name: t('navAdminLottery'), path: '/administracion/loterias', icon: Ticket, count: 12 },
    { name: t('navAdminDocuments'), path: '/administracion/documentos', icon: FileText, count: 0 },
    { name: t('navAdminCreate'), path: '/administracion/crear', icon: Plus, count: 0 },
    { name: t('navAdminSettings'), path: '/administracion/configuracion', icon: Settings, count: 0 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {t('navAdminDashboard')}
              </h1>
              <p className="text-slate-600">
                {t('adminDashboardDescription')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                  </div>
                  <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sections Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6">
            {t('adminSections')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <a
                  key={index}
                  href={section.path}
                  className="flex items-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  <div className={`p-2 bg-white rounded-lg mr-4`}>
                    <Icon className="w-5 h-5 text-slate-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-800">{section.name}</h3>
                    <p className="text-sm text-slate-600">
                      {section.count} {t('items')}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

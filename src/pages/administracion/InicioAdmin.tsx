import React from 'react';
import { useTranslation } from '../../lib/i18n';
import { useSupabase } from '../../lib/SupabaseContext';
import { hasPermission } from '../../lib/permissions';
import { Link } from 'react-router-dom';
import { BarChart3, Users, TrendingUp, Calendar, CreditCard, FileText, Ticket, Plus, Settings, Euro, AlertCircle, CheckCircle, Clock, Target } from 'lucide-react';

export default function InicioAdmin() {
  const { t } = useTranslation();
  const { users, families, categories, events, quotas, eventRegistrations, news } = useSupabase();
  
  // Calcular estadísticas detalladas
  const totalUsers = users?.length || 0;
  const totalFamilies = families?.length || 0;
  const totalEvents = events?.length || 0;
  const totalNews = news?.length || 0;
  const activeEvents = events?.filter(e => e.is_active) || [];
  const pastEvents = events?.filter(e => !e.is_active) || [];
  
  // Estadísticas por categorías
  const usersByCategory = categories?.map(category => ({
    categoryName: category.name,
    count: users?.filter(user => user.category_id === category.id).length || 0,
    quotaAmount: category.quotaamount || 0
  })) || [];
  
  // Estadísticas de cuotas
  const totalAnnualRevenue = usersByCategory.reduce((sum, cat) => sum + (cat.count * cat.quotaAmount), 0);
  const totalMonthlyRevenue = totalAnnualRevenue / 12;
  
  // Dinero pendiente de cobro (usuarios sin cuotas pagadas)
  const unpaidUsers = users?.filter(user => !user.quota_paid) || [];
  const unpaidAmount = unpaidUsers.reduce((sum, user) => {
    const category = categories?.find(cat => cat.id === user.category_id);
    return sum + (category?.quotaamount || 0);
  }, 0);
  
  // Eventos con inscripciones
  const eventsWithRegistrations = events?.filter(event => 
    eventRegistrations?.some(reg => reg.event_id === event.id)
  ) || [];
  
  // Total de inscritos en eventos
  const totalEventRegistrations = eventRegistrations?.length || 0;
  
  const stats = [
    {
      name: t('totalUsers') || 'Total Falleros',
      value: totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      description: t('registeredMembers') || 'Miembros registrados en la falla'
    },
    {
      name: t('totalFamilies') || 'Familias',
      value: totalFamilies,
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      description: t('familyUnits') || 'Unidades familiares'
    },
    {
      name: t('activeEvents') || 'Eventos Activos',
      value: activeEvents.length,
      icon: Calendar,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      description: `${t('ofTotal') || 'De'} ${totalEvents} ${t('total') || 'totales'}`
    },
    {
      name: t('annualRevenue') || 'Ingresos Anuales',
      value: `€${totalAnnualRevenue.toFixed(2)}`,
      icon: Euro,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-100',
      description: `€${totalMonthlyRevenue.toFixed(2)}/${t('month') || 'mes'}`
    }
  ];

  const financialStats = [
    {
      name: t('pendingPayment') || 'Pendiente de Cobro',
      value: `€${unpaidAmount.toFixed(2)}`,
      icon: AlertCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-100',
      description: `${unpaidUsers.length} ${t('members') || 'falleros'}`
    },
    {
      name: t('publishedNews') || 'Noticias Publicadas',
      value: totalNews,
      icon: FileText,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-100',
      description: t('communicationsSent') || 'Comunicaciones emitidas'
    },
    {
      name: t('eventRegistrations') || 'Inscripciones a Eventos',
      value: totalEventRegistrations,
      icon: Target,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100',
      description: `${t('in') || 'En'} ${eventsWithRegistrations.length} ${t('events') || 'eventos'}`
    },
    {
      name: t('completedEvents') || 'Eventos Finalizados',
      value: pastEvents.length,
      icon: CheckCircle,
      color: 'bg-slate-500',
      bgColor: 'bg-slate-100',
      description: t('eventsConcluded') || 'Eventos concluidos'
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  {t('adminDashboard') || 'Panel de Administración'} - Falla Màrtirs
                </h1>
                <p className="text-slate-600 mt-1">
                  {t('adminDashboardDescription') || 'Visión general completa del estado de la falla'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">{t('lastUpdate') || 'Última actualización'}</p>
              <p className="text-sm font-medium text-slate-700">
                {new Date().toLocaleDateString('es-ES', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas Principales */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">{t('generalStats') || 'Estadísticas Generales'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    {(stat.name === (t('pendingPayment') || 'Pendiente de Cobro')) && unpaidAmount > 0 && (
                      <div className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                        {t('requiresAttention') || 'Requiere atención'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</p>
                    <p className="text-sm font-medium text-slate-700 mb-2">{stat.name}</p>
                    <p className="text-xs text-slate-500">{stat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estadísticas Financieras y Operativas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Estadísticas Financieras */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{t('financialStatus') || 'Estado Financiero'}</h2>
            <div className="grid grid-cols-2 gap-4">
              {financialStats.slice(0, 2).map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                      <span className={`text-xs font-medium ${stat.color.replace('bg-', 'text-')}`}>
                        {stat.name}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estadísticas Operativas */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{t('recentActivity') || 'Actividad Reciente'}</h2>
            <div className="grid grid-cols-2 gap-4">
              {financialStats.slice(2, 4).map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                      <span className={`text-xs font-medium ${stat.color.replace('bg-', 'text-')}`}>
                        {stat.name}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Falleros por Categorías */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{t('membersByCategory') || 'Falleros por Categorías'}</h2>
            <div className="space-y-3">
              {usersByCategory.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{category.categoryName}</p>
                      <p className="text-sm text-slate-500">€{category.quotaAmount.toFixed(2)}/{t('year') || 'año'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-800">{category.count}</p>
                    <p className="text-sm text-slate-500">{t('members') || 'falleros'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{t('quickActions') || 'Acciones Rápidas'}</h2>
            <div className="grid grid-cols-2 gap-4">
              {sections.slice(0, 6).map((section, index) => {
                const Icon = section.icon;
                return (
                  <Link
                    key={index}
                    to={section.path}
                    className="flex items-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200 group"
                  >
                    <div className="p-2 bg-white rounded-lg mr-3 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-slate-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-800 text-sm">{section.name}</h3>
                      <p className="text-xs text-slate-600">
                        {section.count} {t('elements') || 'elementos'}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Alertas Importantes */}
        {unpaidAmount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">{t('attention') || 'Atención'}: {t('pendingPayments') || 'Cobros Pendientes'}</h3>
                <p className="text-sm text-red-800">
                  {t('pendingPaymentsDescription') || `Hay ${unpaidUsers.length} falleros con cuotas pendientes por un total de €${unpaidAmount.toFixed(2)}.`} 
                  <Link to="/administracion/cuotas" className="underline font-medium ml-1">{t('managePayments') || 'Gestionar cobros'}</Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

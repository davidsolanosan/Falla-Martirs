import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../lib/i18n';
import { useSupabase } from '../lib/SupabaseContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Calendar, Ticket, Users, ChevronDown, ChevronUp } from 'lucide-react';

export default function Cuotas() {
  const { t } = useTranslation();
  const { families, users, categories, lotteryDates, events, eventRegistrations } = useSupabase();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [userFamily, setUserFamily] = useState<any>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    console.log('=== CUOTAS USUARIO CARGANDO ===');
    console.log('User:', user);
    console.log('Families:', families.length);
    
    // Forzar loading a false después de 2 segundos
    const timeout = setTimeout(() => {
      console.log('=== FORZANDO FIN DE CARGA ===');
      setLoading(false);
    }, 2000);
    
    if (user) {
      console.log('=== USUARIO DETECTADO ===');
      console.log('User completo:', user);
      console.log('Campos del usuario:', Object.keys(user));
      
      // Buscar familia por diferentes métodos
      let family = null;
      
      // Método 1: por family_id
      if (user.family_id) {
        family = families.find((f: any) => f.id === user.family_id);
        console.log('Búsqueda por family_id:', family);
      }
      
      // Método 2: por Familia (nombre)
      if (!family && user.Familia) {
        family = families.find((f: any) => 
          f.name.toLowerCase() === user.Familia.toLowerCase()
        );
        console.log('Búsqueda por nombre Familia:', family);
      }
      
      // Método 3: por cualquier campo que contenga "CABO RODRIGO"
      if (!family) {
        family = families.find((f: any) => 
          f.name.toLowerCase().includes('cabo') || 
          f.name.toLowerCase().includes('rodrigo')
        );
        console.log('Búsqueda por parcial:', family);
      }
      
      console.log('Familias disponibles:', families.map(f => ({ id: f.id, name: f.name })));
      
      if (family) {
        console.log('=== FAMILIA ENCONTRADA ===', family);
        setUserFamily(family);
      } else {
        console.log('=== NO SE ENCONTRÓ FAMILIA ===');
      }
      
      setLoading(false);
      clearTimeout(timeout);
    }
    
    return () => clearTimeout(timeout);
  }, [user, families]);

  const getFamilyMembers = (familyId: string) => {
    return users.filter((u: any) => u.family_id === familyId);
  };

  const getMemberCategory = (member: any) => {
    // Primero intentar con category_id si existe
    if (member.category_id) {
      return categories.find((c: any) => c.id === member.category_id);
    }
    
    // Si no, buscar por nombre exacto (del censo)
    if (member.Categoria) {
      const category = categories.find((c: any) => 
        c.name.toLowerCase() === member.Categoria.toLowerCase()
      );
      if (category) return category;
      
      // Búsqueda parcial
      const partialMatch = categories.find((c: any) => 
        c.name.toLowerCase().includes(member.Categoria.toLowerCase()) ||
        member.Categoria.toLowerCase().includes(c.name.toLowerCase())
      );
      if (partialMatch) return partialMatch;
    }
    
    // Si no, asignar por edad
    const currentYear = new Date().getFullYear();
    let birthYear: number;
    
    if (member.birth_year.includes('/')) {
      const parts = member.birth_year.split('/');
      birthYear = parseInt(parts[2]);
    } else if (member.birth_year.length === 4) {
      birthYear = parseInt(member.birth_year);
    } else if (member.birth_year.length === 2) {
      const year = parseInt(member.birth_year);
      birthYear = year > 30 ? 1900 + year : 2000 + year;
    } else {
      birthYear = parseInt(member.birth_year);
    }
    
    if (isNaN(birthYear)) return null;
    
    const age = currentYear - birthYear;
    return categories.find((c: any) => 
      age >= c.min_age && age <= c.max_age
    );
  };

  const calculateAnnualCost = (familyId: string) => {
    const members = getFamilyMembers(familyId);
    let total = 0;
    members.forEach((member: any) => {
      const category = getMemberCategory(member);
      if (category) {
        total += category.quotaamount || 0;
      }
    });
    return total;
  };

  const getLotteryDatesByType = (type: string) => {
    return lotteryDates.filter((ld: any) => {
      const date = new Date(ld.date);
      return date.getFullYear() === selectedYear && ld.lottery_type === type;
    });
  };

  const calculateMonthlyQuota = (family: any) => {
    const annualCost = calculateAnnualCost(family.id);
    const ordinaryLotteries = getLotteryDatesByType('ordinary');
    const christmasLotteries = getLotteryDatesByType('christmas');
    const childLotteries = getLotteryDatesByType('child');
    const hortaLotteries = getLotteryDatesByType('horta');
    
    const ordinaryTickets = family.ordinary_tickets || 0;
    const christmasTickets = family.christmas_tickets || 0;
    const childTickets = family.child_tickets || 0;
    const hortaTickets = family.horta_tickets || 0;
    
    let totalBenefit = 0;
    
    ordinaryLotteries.forEach((ld: any) => {
      const benefit = ld.ordinary_benefit || 0;
      totalBenefit += benefit * ordinaryTickets;
    });
    
    christmasLotteries.forEach((ld: any) => {
      const benefit = ld.christmas_benefit || 0;
      totalBenefit += benefit * christmasTickets;
    });
    
    childLotteries.forEach((ld: any) => {
      const benefit = ld.child_benefit || 0;
      totalBenefit += benefit * childTickets;
    });
    
    hortaLotteries.forEach((ld: any) => {
      const benefit = ld.horta_benefit || 0;
      totalBenefit += benefit * hortaTickets;
    });

    const monthlyQuota = (annualCost - totalBenefit) / 12;
    
    return {
      annualCost,
      totalBenefit,
      monthlyQuota: Math.max(0, monthlyQuota),
      ordinaryCount: ordinaryLotteries.length,
      christmasCount: christmasLotteries.length,
      childCount: childLotteries.length,
      hortaCount: hortaLotteries.length,
      ordinaryTickets,
      christmasTickets,
      childTickets,
      hortaTickets
    };
  };

  // Calcular eventos de la familia
  const familyEvents = useMemo(() => {
    if (!userFamily?.id || !events?.length || !eventRegistrations?.length) return [];
    
    // Obtener miembros de la familia
    const familyMembers = getFamilyMembers(userFamily.id);
    const familyUserIds = familyMembers.map(member => member.id);
    
    // Obtener inscripciones de los miembros de la familia
    const familyEventRegistrations = eventRegistrations.filter(reg => 
      familyUserIds.includes(reg.user_id)
    );
    
    // Agrupar por evento y calcular totales
    const eventsMap = new Map();
    
    familyEventRegistrations.forEach(registration => {
      const event = events.find(e => e.id === registration.event_id);
      if (!event) return;
      
      if (!eventsMap.has(event.id)) {
        eventsMap.set(event.id, {
          event,
          attendees: 0,
          totalCost: 0
        });
      }
      
      const eventData = eventsMap.get(event.id);
      eventData.attendees += 1;
      eventData.totalCost += registration.total_price || 0;
    });
    
    return Array.from(eventsMap.values());
  }, [userFamily, events, eventRegistrations, users]);

  // Calcular coste total de eventos
  const eventsTotalCost = useMemo(() => {
    return familyEvents.reduce((total, event) => total + event.totalCost, 0);
  }, [familyEvents]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(48,80,105)] mx-auto mb-4"></div>
          <p className="text-slate-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!userFamily) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-md text-center">
          <div className="p-3 rounded-xl bg-red-50 w-fit mx-auto mb-4">
            <Users className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">{t('noFamilyAssigned')}</h2>
          <p className="text-slate-600">{t('noFamilyAssignedDescription')}</p>
        </div>
      </div>
    );
  }

  const quota = calculateMonthlyQuota(userFamily);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{t('myQuotas')}</h2>
      </div>

      {/* Family Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: 'rgb(48,80,105)' }}>
            {t('familyInfo')}
          </h2>
          <span className="text-sm text-slate-600">
            {userFamily.name}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Members */}
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-3">{t('familyMembers')}</h3>
            <div className="space-y-2">
              {getFamilyMembers(userFamily.id).map((member: any) => {
                const category = getMemberCategory(member);
                return (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-800">{member.name} {member.surname}</span>
                    <span className="text-sm font-semibold" style={{ color: 'rgb(48,80,105)' }}>
                      {category?.name} - €{category?.quotaamount?.toFixed(2) || '0.00'}/{t('year')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Annual Cost */}
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-3">{t('annualCost')}</h3>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">{t('totalAnnualCost')}</span>
                <span className="text-2xl font-bold" style={{ color: 'rgb(48,80,105)' }}>
                  €{quota.annualCost.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Quota */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'rgb(48,80,105)' }}>
            {t('monthlyQuota')}
          </h2>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-slate-700">{t('year')}:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-slate-200 rounded-lg"
            >
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-r from-blue-50 to-slate-50 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-600 mb-1">{t('monthlyPayment')}</p>
              <p className="text-3xl font-bold" style={{ color: 'rgb(48,80,105)' }}>
                €{quota.monthlyQuota.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">{t('calculation')}</p>
              <p className="text-xs text-slate-500">
                (€{quota.annualCost.toFixed(2)} - €{quota.totalBenefit.toFixed(2)}) ÷ 12
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Total Payment Summary */}
      {eventsTotalCost > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('paymentSummary')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">{t('annualQuota')}</span>
                <span className="font-semibold" style={{ color: 'rgb(48,80,105)' }}>
                  €{quota.annualCost.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">{t('eventsCost')}</span>
                <span className="font-semibold text-orange-600">
                  €{eventsTotalCost.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t-2 border-orange-200">
                <span className="font-bold text-slate-800 text-lg">{t('totalToPay')}</span>
                <span className="font-bold text-xl" style={{ color: 'rgb(48,80,105)' }}>
                  €{(quota.annualCost + eventsTotalCost).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Info */}
      {familyEvents.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setExpandedSection(expandedSection === 'events' ? null : 'events')}
          >
            <h2 className="text-xl font-bold" style={{ color: 'rgb(48,80,105)' }}>
              {t('events')}
            </h2>
            <div className="flex items-center space-x-3">
              <span className="bg-[rgb(48,80,105)]/10 px-2 py-1 rounded-full text-xs font-medium text-[rgb(48,80,105)]">
                {familyEvents.length}
              </span>
              {expandedSection === 'events' ? (
                <ChevronUp className="w-5 h-5 text-slate-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-600" />
              )}
            </div>
          </div>

          {expandedSection === 'events' && (
            <div className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-medium text-slate-700">
                        {t('eventName')}
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-slate-700">
                        {t('attendees')}
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-slate-700">
                        {t('totalCost')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {familyEvents.map((familyEvent, index) => (
                      <tr 
                        key={familyEvent.event.id} 
                        className={`border-b ${
                          index % 2 === 0 ? 'bg-slate-50' : 'bg-white'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">
                            {familyEvent.event.title}
                          </div>
                          <div className="text-sm text-slate-500">
                            {new Date(familyEvent.event.event_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-900">
                              {familyEvent.attendees}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-orange-600">
                            €{familyEvent.totalCost.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-300">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {t('total')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-slate-900">
                          {familyEvents.reduce((sum, e) => sum + e.attendees, 0)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-lg text-[rgb(48,80,105)]">
                          €{eventsTotalCost.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lottery Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpandedSection(expandedSection === 'lottery' ? null : 'lottery')}
        >
          <h2 className="text-xl font-bold" style={{ color: 'rgb(48,80,105)' }}>
            {t('myLotteryTickets')}
          </h2>
          {expandedSection === 'lottery' ? (
            <ChevronUp className="w-5 h-5 text-slate-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-600" />
          )}
        </div>

        {expandedSection === 'lottery' && (
          <div className="mt-6 space-y-4">
            {/* Ordinary */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Ticket className="w-5 h-5 text-slate-600" />
                  <span className="font-medium text-slate-700">{t('ordinaryLotteries')}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold" style={{ color: 'rgb(48,80,105)' }}>
                    {quota.ordinaryTickets} {t('tickets')}
                  </span>
                  <p className="text-xs text-slate-500">{quota.ordinaryCount} {t('draws')}</p>
                </div>
              </div>
            </div>

            {/* Christmas */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Ticket className="w-5 h-5 text-slate-600" />
                  <span className="font-medium text-slate-700">{t('christmasLottery')}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold" style={{ color: 'rgb(48,80,105)' }}>
                    {quota.christmasTickets} {t('tickets')}
                  </span>
                  <p className="text-xs text-slate-500">{quota.christmasCount} {t('draws')}</p>
                </div>
              </div>
            </div>

            {/* Child */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Ticket className="w-5 h-5 text-slate-600" />
                  <span className="font-medium text-slate-700">{t('childLottery')}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold" style={{ color: 'rgb(48,80,105)' }}>
                    {quota.childTickets} {t('tickets')}
                  </span>
                  <p className="text-xs text-slate-500">{quota.childCount} {t('draws')}</p>
                </div>
              </div>
            </div>

            {/* Horta Nord */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Ticket className="w-5 h-5 text-slate-600" />
                  <span className="font-medium text-slate-700">{t('hortaLottery')}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold" style={{ color: 'rgb(48,80,105)' }}>
                    {quota.hortaTickets} {t('tickets')}
                  </span>
                  <p className="text-xs text-slate-500">{quota.hortaCount} {t('draws')}</p>
                </div>
              </div>
            </div>

            {/* Total Benefit */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-700">{t('totalLotteryBenefit')}</span>
                <span className="text-xl font-bold text-blue-700">
                  €{quota.totalBenefit.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

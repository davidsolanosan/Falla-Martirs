import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useSupabase } from '../../lib/SupabaseContext';
import { CreditCard, Calendar, Ticket, Users, ChevronDown, ChevronUp } from 'lucide-react';

export default function CuotasUsuario() {
  const { t } = useTranslation();
  const { families, users, categories, lotteryDates, user } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [userFamily, setUserFamily] = useState<any>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    if (user && families.length > 0) {
      // Encontrar la familia del usuario actual
      const family = families.find((f: any) => f.id === user.family_id);
      if (family) {
        setUserFamily(family);
      }
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgb(239,246,255)' }}>
              <CreditCard className="w-6 h-6" style={{ color: 'rgb(48,80,105)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'rgb(48,80,105)' }}>
                {t('myQuotas')}
              </h1>
              <p className="text-slate-600">
                {t('myQuotasDescription')}
              </p>
            </div>
          </div>
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
    </div>
  );
}

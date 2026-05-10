import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useSupabase } from '../../lib/SupabaseContext';
import { CreditCard, Calculator, ChevronDown, ChevronUp, Save, X, Search } from 'lucide-react';

export default function CuotasAdmin() {
  const { t } = useTranslation();
  const { families, users, categories, lotteryDates, updateFamily, updateLotteryDate, updateUser } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedFamily, setSelectedFamily] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [expandedFamily, setExpandedFamily] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Debug: Ver qué datos tenemos
    console.log('=== DEBUG CUOTAS ===');
    console.log('Usuarios:', users.length);
    console.log('Categorías:', categories.length);
    console.log('Familias:', families.length);
    
    if (users.length > 0) {
      console.log('Primer usuario:', users[0]);
      console.log('Campos del usuario:', Object.keys(users[0]));
    }
    
    if (categories.length > 0) {
      console.log('Primera categoría:', categories[0]);
      console.log('Campos de la categoría:', Object.keys(categories[0]));
    }
    
    // No ejecutar assignCategoriesByAge automáticamente para evitar bucle infinito
    // Se ejecutará manualmente cuando sea necesario
    
    setLoading(false);
  }, [families, users, categories, lotteryDates]);

  // Filtrar y ordenar familias
  const filteredAndSortedFamilies = families
    .filter((family: any) => 
      family.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: any, b: any) => 
      a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
    );

  const getFamilyMembers = (familyId: string) => {
    return users.filter((u: any) => u.family_id === familyId);
  };

  const getMemberCategory = (member: any) => {
    // Primero intentar con category_id si existe
    if (member.category_id) {
      const category = categories.find((c: any) => c.id === member.category_id);
      console.log(`${member.name} tiene category_id asignado: ${member.category_id} → Categoría: ${category?.name}`);
      return category;
    }
    
    // Si no, buscar por nombre exacto (del censo)
    if (member.Categoria) {
      const category = categories.find((c: any) => 
        c.name.toLowerCase() === member.Categoria.toLowerCase()
      );
      console.log(`${member.name} tiene categoría del censo: "${member.Categoria}" → Encontrada: ${category?.name}`);
      if (category) return category;
      
      // Si no encuentra por nombre exacto, intentar búsqueda parcial
      const partialMatch = categories.find((c: any) => 
        c.name.toLowerCase().includes(member.Categoria.toLowerCase()) ||
        member.Categoria.toLowerCase().includes(c.name.toLowerCase())
      );
      console.log(`Búsqueda parcial para "${member.Categoria}": ${partialMatch?.name}`);
      if (partialMatch) return partialMatch;
    }
    
    // Si no, asignar por edad (birth_year es AÑO DE NACIMIENTO)
    const currentYear = new Date().getFullYear();
    console.log(`DEBUG: ${member.name} birth_year原始值: "${member.birth_year}"`);
    
    // Intentar diferentes formatos
    let birthYear: number;
    
    if (member.birth_year.includes('/')) {
      // Formato: DD/MM/YYYY o MM/DD/YYYY
      const parts = member.birth_year.split('/');
      birthYear = parseInt(parts[2]); // Tomar el último como año
    } else if (member.birth_year.length === 4) {
      // Formato: YYYY
      birthYear = parseInt(member.birth_year);
    } else if (member.birth_year.length === 2) {
      // Formato: YY (asumir 1900s o 2000s)
      const year = parseInt(member.birth_year);
      birthYear = year > 30 ? 1900 + year : 2000 + year;
    } else {
      // Intentar parse directo
      birthYear = parseInt(member.birth_year);
    }
    
    if (isNaN(birthYear)) {
      console.log('Miembro sin birth_year válido:', member.name, member.birth_year);
      return null;
    }
    
    const age = currentYear - birthYear;
    console.log(`Calculando categoría para: ${member.name}, Año nacimiento: ${birthYear}, Edad: ${age}`);
    
    const category = categories.find((c: any) => 
      age >= c.min_age && age <= c.max_age
    );
    
    console.log(`Categoría encontrada para ${member.name}: ${category?.name} (rango: ${category?.min_age}-${category?.max_age})`);
    
    return category;
  };

  const assignCategoriesByAge = async () => {
    console.log('Asignando categorías por edad a todos los usuarios...');
    
    users.forEach((user: any) => {
      let birthYear: number;
      
      // Manejar formato DD/MM/YYYY o YYYY
      if (user.birth_year.includes('/')) {
        // Formato DD/MM/YYYY - extraer el año
        const parts = user.birth_year.split('/');
        if (parts.length === 3) {
          birthYear = parseInt(parts[2]);
        } else {
          console.log('Formato de birth_year inválido:', user.birth_year, user.name);
          return;
        }
      } else {
        // Formato YYYY
        birthYear = parseInt(user.birth_year);
      }
      
      if (isNaN(birthYear)) {
        console.log('Usuario sin birth_year válido:', user.name, user.birth_year);
        return;
      }
      
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      
      const category = categories.find((c: any) => 
        age >= c.min_age && age <= c.max_age
      );
      
      if (category) {
        console.log(`✅ Asignando categoría "${category.name}" (${category.id}) a ${user.name} (${age} años)`);
        console.log(`🔧 Actualizando usuario ${user.id} con category_id: ${category.id}`);
        
        // Actualizar category_id en la base de datos
        updateUser(user.id, { category_id: category.id })
          .then(() => {
            console.log(`✅ Categoría actualizada correctamente para ${user.name}`);
          })
          .catch((error) => {
            console.error(`❌ Error al actualizar categoría para ${user.name}:`, error);
          });
      } else {
        console.log('❌ No se encontró categoría para:', user.name, 'Edad:', age);
      }
    });
  };

  const calculateAnnualCost = (familyId: string) => {
    const members = getFamilyMembers(familyId);
    let total = 0;
    members.forEach((member: any) => {
      const category = getMemberCategory(member);
      if (category) {
        total += category.quotaamount || 0;
        console.log(`Miembro: ${member.name}, Categoría: ${category.name}, Cuota: €${category.quotaamount}`);
      } else {
        console.log(`Miembro sin categoría: ${member.name}`);
      }
    });
    console.log(`Coste anual total familia ${familyId}: €${total}`);
    return total;
  };

  const getLotteryDatesByType = (type: string) => {
    return lotteryDates.filter((ld: any) => {
      const date = new Date(ld.date);
      const year = date.getFullYear();
      const month = date.getMonth(); // 0 = enero, 2 = marzo, 3 = abril
      const day = date.getDate();
      
      // Lógica del año fallero: 1 de abril al 30 de marzo del año siguiente
      if (selectedYear === 2026) {
        // Año fallero 2026: 01/04/2026 - 30/03/2027
        if (year === 2026) {
          // Del 01/04/2026 al 31/12/2026
          return (month > 3 || (month === 3 && day >= 1)) && ld.lottery_type === type;
        } else if (year === 2027) {
          // Del 01/01/2027 al 30/03/2027
          return (month < 3 || (month === 2 && day <= 30)) && ld.lottery_type === type;
        }
      } else if (selectedYear === 2025) {
        // Año fallero 2025: 01/04/2025 - 30/03/2026
        if (year === 2025) {
          // Del 01/04/2025 al 31/12/2025
          return (month > 3 || (month === 3 && day >= 1)) && ld.lottery_type === type;
        } else if (year === 2026) {
          // Del 01/01/2026 al 30/03/2026
          return (month < 3 || (month === 2 && day <= 30)) && ld.lottery_type === type;
        }
      } else if (selectedYear === 2027) {
        // Año fallero 2027: 01/04/2027 - 30/03/2028
        if (year === 2027) {
          // Del 01/04/2027 al 31/12/2027
          return (month > 3 || (month === 3 && day >= 1)) && ld.lottery_type === type;
        } else if (year === 2028) {
          // Del 01/01/2028 al 30/03/2028
          return (month < 3 || (month === 2 && day <= 30)) && ld.lottery_type === type;
        }
      }
      
      // Para otros años, usar año calendario como fallback
      return date.getFullYear() === selectedYear && ld.lottery_type === type;
    });
  };

  const calculateMonthlyQuota = (family: any) => {
    const annualCost = calculateAnnualCost(family.id);
    
    // Obtener sorteos por tipo
    const ordinaryLotteries = getLotteryDatesByType('ordinary');
    const christmasLotteries = getLotteryDatesByType('christmas');
    const childLotteries = getLotteryDatesByType('child');
    const hortaLotteries = getLotteryDatesByType('horta');
    
    // Obtener papeletas por tipo de la familia
    const ordinaryTickets = family.ordinary_tickets || 0;
    const christmasTickets = family.christmas_tickets || 0;
    const childTickets = family.child_tickets || 0;
    const hortaTickets = family.horta_tickets || 0;
    
    // Calcular beneficio total por tipo
    let totalBenefit = 0;
    
    // Beneficio ordinarios ({ordinaryLotteries.length} sorteos)
    ordinaryLotteries.forEach((ld: any) => {
      const benefit = ld.ordinary_benefit || 0;
      totalBenefit += benefit * ordinaryTickets;
    });
    
    // Beneficio Navidad ({christmasLotteries.length} sorteos)
    christmasLotteries.forEach((ld: any) => {
      const benefit = ld.christmas_benefit || 0;
      totalBenefit += benefit * christmasTickets;
    });
    
    // Beneficio Niño ({childLotteries.length} sorteos)
    childLotteries.forEach((ld: any) => {
      const benefit = ld.child_benefit || 0;
      totalBenefit += benefit * childTickets;
    });
    
    // Beneficio Horta Nord ({hortaLotteries.length} sorteos)
    hortaLotteries.forEach((ld: any) => {
      const benefit = ld.horta_benefit || 0;
      totalBenefit += benefit * hortaTickets;
    });

    // Cuota mensual = (Coste anual - Beneficio lotería) / 12
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

  const handleFamilySelect = (family: any) => {
    setSelectedFamily(family);
    setShowModal(true);
  };

  const handleSaveFamily = async () => {
    if (!selectedFamily) return;
    
    try {
      await updateFamily(selectedFamily.id, {
        ticket_start: selectedFamily.ticket_start,
        ticket_end: selectedFamily.ticket_end,
        ordinary_tickets: selectedFamily.ordinary_tickets,
        christmas_tickets: selectedFamily.christmas_tickets,
        child_tickets: selectedFamily.child_tickets,
        horta_tickets: selectedFamily.horta_tickets
      });
      setShowModal(false);
      alert('Familia actualizada correctamente');
    } catch (error) {
      console.error('Error actualizando familia:', error);
      alert('Error al actualizar la familia');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgb(239,246,255)' }}>
                <CreditCard className="w-6 h-6" style={{ color: 'rgb(48,80,105)' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'rgb(48,80,105)' }}>
                  {t('navAdminQuotas')}
                </h1>
                <p className="text-slate-600">
                  {t('quotaManagementDescription')}
                </p>
              </div>
            </div>
            <button
              onClick={assignCategoriesByAge}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
            >
              🐛 Depurar Categorías
            </button>
          </div>
        </div>

        {/* Year and Search Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Year Selector */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-slate-700">Año:</label>
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
            
            {/* Search Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar familia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Families List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">Familias</h3>
            <span className="text-sm text-slate-500">
              {filteredAndSortedFamilies.length} de {families.length} familias
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredAndSortedFamilies.length > 0 ? (
              filteredAndSortedFamilies.map((family: any) => {
                const quota = calculateMonthlyQuota(family);
                const isExpanded = expandedFamily === family.id;

                return (
                  <div key={family.id}>
                  <div 
                    className="p-4 sm:p-6 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setExpandedFamily(isExpanded ? null : family.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-base font-bold text-slate-800">{family.name}</h4>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFamilySelect(family);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-white text-[rgb(48,80,105)] border-3 border-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)] hover:text-white rounded-xl transition-all text-sm font-medium"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Configurar
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Miembros:</span>
                            <span className="ml-2 font-semibold text-slate-800">{getFamilyMembers(family.id).length}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Cuota mensual:</span>
                            <span className="ml-2 font-semibold text-slate-800">€{quota.monthlyQuota.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Coste anual:</span>
                            <span className="ml-2 font-semibold text-slate-800">€{quota.annualCost.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Beneficio lotería:</span>
                            <span className="ml-2 font-semibold text-slate-800">€{quota.totalBenefit.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Ordinarios ({quota.ordinaryCount}):</span>
                            <span className="ml-2 font-semibold text-slate-800">{quota.ordinaryTickets} papeletas</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Navidad ({quota.christmasCount}):</span>
                            <span className="ml-2 font-semibold text-slate-800">{quota.christmasTickets} papeletas</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Niño ({quota.childCount}):</span>
                            <span className="ml-2 font-semibold text-slate-800">{quota.childTickets} papeletas</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Horta Nord ({quota.hortaCount}):</span>
                            <span className="ml-2 font-semibold text-slate-800">{quota.hortaTickets} papeletas</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
              })
            ) : (
              <div className="p-8 text-center">
                <div className="text-slate-400 mb-2">
                  <Search className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-slate-500 text-lg">
                  {searchTerm ? 'No se encontraron familias con ese nombre' : 'No hay familias disponibles'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Configuration Modal */}
        {showModal && selectedFamily && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">
                  Configurar Cuotas - {selectedFamily.name}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Members and Categories */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Miembros y Categorías</h4>
                  <div className="space-y-2">
                    {getFamilyMembers(selectedFamily.id).map((member: any) => {
                      const category = getMemberCategory(member);
                      return (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm text-slate-800">{member.name} {member.surname}</span>
                          <span className="text-sm font-semibold text-[rgb(48,80,105)]">
                            {category?.name} - €{category?.quotaamount?.toFixed(2) || '0.00'}/año
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Annual Cost */}
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Coste anual total:</span>
                    <span className="text-2xl font-bold text-[rgb(48,80,105)]">
                      €{calculateAnnualCost(selectedFamily.id).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Lottery Configuration */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Configuración de Papeletas</h4>
                  
                  {/* Numeración */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Papeleta inicial
                      </label>
                      <input
                        type="number"
                        value={selectedFamily.ticket_start || ''}
                        onChange={(e) => setSelectedFamily({
                          ...selectedFamily,
                          ticket_start: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        placeholder="11"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Papeleta final
                      </label>
                      <input
                        type="number"
                        value={selectedFamily.ticket_end || ''}
                        onChange={(e) => setSelectedFamily({
                          ...selectedFamily,
                          ticket_end: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        placeholder="21"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Total papeletas
                      </label>
                      <input
                        type="text"
                        value={(selectedFamily.ticket_end || 0) - (selectedFamily.ticket_start || 0) + 1}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Papeletas por tipo */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Sorteos Ordinarios ({getLotteryDatesByType('ordinary').length})
                      </label>
                      <input
                        type="number"
                        value={selectedFamily.ordinary_tickets || ''}
                        onChange={(e) => setSelectedFamily({
                          ...selectedFamily,
                          ordinary_tickets: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Lotería Navidad (1)
                      </label>
                      <input
                        type="number"
                        value={selectedFamily.christmas_tickets || ''}
                        onChange={(e) => setSelectedFamily({
                          ...selectedFamily,
                          christmas_tickets: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Lotería del Niño (1)
                      </label>
                      <input
                        type="number"
                        value={selectedFamily.child_tickets || ''}
                        onChange={(e) => setSelectedFamily({
                          ...selectedFamily,
                          child_tickets: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Lotería Horta Nord (1)
                      </label>
                      <input
                        type="number"
                        value={selectedFamily.horta_tickets || ''}
                        onChange={(e) => setSelectedFamily({
                          ...selectedFamily,
                          horta_tickets: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculation Summary */}
                <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Resumen del Cálculo</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Coste anual:</span>
                      <span className="font-semibold text-slate-800">€{calculateAnnualCost(selectedFamily.id).toFixed(2)}</span>
                    </div>
                    
                    {/* Desglose por tipo */}
                    <div className="pt-2 border-t border-slate-200">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Ordinarios ({getLotteryDatesByType('ordinary').length} sorteos):</span>
                        <span className="font-semibold text-slate-800">{selectedFamily.ordinary_tickets || 0} papeletas</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Navidad ({getLotteryDatesByType('christmas').length} sorteos):</span>
                        <span className="font-semibold text-slate-800">{selectedFamily.christmas_tickets || 0} papeletas</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Niño ({getLotteryDatesByType('child').length} sorteos):</span>
                        <span className="font-semibold text-slate-800">{selectedFamily.child_tickets || 0} papeletas</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Horta Nord ({getLotteryDatesByType('horta').length} sorteos):</span>
                        <span className="font-semibold text-slate-800">{selectedFamily.horta_tickets || 0} papeletas</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-600">Beneficio total papeletas:</span>
                      <span className="font-semibold text-slate-800">€{calculateMonthlyQuota(selectedFamily).totalBenefit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200">
                      <span className="text-slate-700 font-medium">Cuota mensual:</span>
                      <span className="text-xl font-bold text-[rgb(48,80,105)]">
                        €{calculateMonthlyQuota(selectedFamily).monthlyQuota.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveFamily}
                  className="inline-flex items-center px-4 py-2 bg-[rgb(48,80,105)] text-white rounded-lg hover:bg-[rgb(38,70,95)] transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

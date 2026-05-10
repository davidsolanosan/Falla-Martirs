import React, { useState, useEffect } from 'react';
import { useTranslation } from '../lib/i18n';
import { useSupabase } from '../lib/SupabaseContext';
import { LotteryDate, LotteryTicket, supabase } from '../lib/supabase';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CalendarIcon, 
  CurrencyEuroIcon,
  CurrencyDollarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface LotteryFormData {
  date: string;
  name: string;
  special: boolean;
  lottery_price: string;
  primitive_price: string;
  donation_price: string;
  prize_amount: string;
}

export default function LoteriasAdmin() {
  const { t } = useTranslation();
  const { lotteryDates, refreshLotteryDates } = useSupabase();
  
  // Load lottery dates
  const loadLotteryDates = async () => {
    try {
      console.log('🔄 Loading lottery dates...');
      await refreshLotteryDates();
      console.log('✅ Lottery dates loaded');
    } catch (error) {
      console.error('❌ Error loading lottery dates:', error);
    }
  };
  
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(t('language'));
  
  // Recalcular cuando cambia el idioma
  useEffect(() => {
    setLanguage(t('language'));
  }, [t('language')]);
  const [submitting, setSubmitting] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [showPrizes, setShowPrizes] = useState(false);
  const [selectedLotteryForPrizes, setSelectedLotteryForPrizes] = useState<LotteryDate | null>(null);
  const [editingLottery, setEditingLottery] = useState<LotteryDate | null>(null);
  const [prizes, setPrizes] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<LotteryFormData>({
    date: '',
    name: '',
    special: false,
    lottery_price: '0.50',
    primitive_price: '0.30',
    donation_price: '0.20',
    prize_amount: ''
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      date: '',
      name: '',
      special: false,
      lottery_price: '0.50',
      primitive_price: '0.30',
      donation_price: '0.20',
      prize_amount: ''
    });
    setEditingLottery(null);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const lotteryData = {
        date: formData.date,
        name: formData.name,
        special: formData.special,
        lottery_price: parseFloat(formData.lottery_price),
        primitive_price: formData.primitive_price ? parseFloat(formData.primitive_price) : null,
        donation_price: parseFloat(formData.donation_price),
        prize_amount: formData.prize_amount ? parseFloat(formData.prize_amount) : null
      };

      console.log('Form data:', formData);
      console.log('Lottery data:', lotteryData);
      console.log('Editing lottery:', editingLottery);
      console.log('Supabase client:', supabase);

      if (!supabase) {
        throw new Error('Supabase client is not available');
      }

      if (editingLottery) {
        const { error } = await supabase
          .from('lottery_dates')
          .update(lotteryData)
          .eq('id', editingLottery.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('lottery_dates')
          .insert([lotteryData]);
        
        if (error) throw error;
      }

      resetForm();
      setShowForm(false);
      
      // Recargar datos para ver los cambios
      await refreshLotteryDates();
    } catch (error) {
      console.error('Error saving lottery:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
      alert('Error al guardar el sorteo: ' + (error as Error)?.message || 'Error desconocido');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit lottery
  const editLottery = (lottery: LotteryDate) => {
    setEditingLottery(lottery);
    setFormData({
      date: lottery.date,
      name: lottery.name,
      special: lottery.special || false,
      lottery_price: lottery.lottery_price.toString(),
      primitive_price: lottery.primitive_price?.toString() || '',
      donation_price: lottery.donation_price.toString(),
      prize_amount: lottery.prize_amount?.toString() || ''
    });
    setShowForm(true);
  };

  // Delete lottery
  const deleteLottery = async (lottery: LotteryDate) => {
    if (!confirm(`¿Estás seguro de eliminar el sorteo "${lottery.name}"?`)) return;
    
    try {
      console.log('🗑️ Deleting lottery:', { id: lottery.id, name: lottery.name, date: lottery.date });
      
      const { error, data } = await supabase
        .from('lottery_dates')
        .delete()
        .eq('id', lottery.id)
        .select();
      
      console.log('🗑️ Delete result:', { error, data });
      
      if (error) {
        console.error('❌ Supabase delete error:', error);
        throw error;
      }
      
      console.log('✅ Lottery deleted successfully, reloading dates...');
      await loadLotteryDates();
      console.log('✅ Dates reloaded');
    } catch (error) {
      console.error('❌ Error deleting lottery:', error);
      alert(`Error al eliminar el sorteo: ${error.message || error}`);
    }
  };

  // Load prizes
  const loadPrizes = async (lotteryId: string) => {
    try {
      const { data, error } = await supabase
        .from('lottery_prizes')
        .select('*')
        .eq('lottery_date_id', lotteryId)
        .order('prize_type');
      
      if (error) throw error;
      setPrizes(data || []);
    } catch (error) {
      console.error('Error loading prizes:', error);
    }
  };

  const managePrizes = (lottery: LotteryDate) => {
    setSelectedLotteryForPrizes(lottery);
    setShowPrizes(true);
    loadPrizes(lottery.id);
  };

  const toggleMonth = (month: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(month)) {
      newExpanded.delete(month);
    } else {
      newExpanded.add(month);
    }
    setExpandedMonths(newExpanded);
  };

  // Función para generar nombre bilingüe del sorteo
  const getLotteryDisplayName = (lottery: LotteryDate) => {
    if (!lottery.name) {
      const date = new Date(lottery.date);
      const day = date.getDate();
      
      // Usar traducciones de meses del i18n
      const monthKeys = ['january', 'february', 'march', 'april', 'may', 'june', 
                        'july', 'august', 'september', 'october', 'november', 'december'];
      const month = t(monthKeys[date.getMonth()]);
      const year = date.getFullYear();
      
      return t('language') === 'va' 
        ? `Sorteig ${day} - ${month} de ${year}`
        : `Sorteo ${day} - ${month} de ${year}`;
    }
    return lottery.name;
  };

  const groupLotteriesByMonth = (lotteries: LotteryDate[]) => {
    const months: { [key: string]: LotteryDate[] } = {};
    
    // Usar traducciones de meses del i18n
    const monthKeys = ['january', 'february', 'march', 'april', 'may', 'june', 
                      'july', 'august', 'september', 'october', 'november', 'december'];
    const monthNames = monthKeys.map(key => t(key));
    
    lotteries.forEach(lottery => {
      const date = new Date(lottery.date);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      
      if (!months[monthKey]) {
        months[monthKey] = [];
      }
      months[monthKey].push(lottery);
    });
    
    // Ordenar meses cronológicamente
    const sortedMonths = Object.keys(months).sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      
      const monthIndexA = monthNames.indexOf(monthA);
      const monthIndexB = monthNames.indexOf(monthB);
      
      if (yearA !== yearB) {
        return parseInt(yearA) - parseInt(yearB);
      }
      
      return monthIndexA - monthIndexB;
    });
    
    return sortedMonths.map(month => ({
      month,
      lotteries: months[month]
    }));
  };

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const calculateTotal = (lottery: LotteryDate) => {
    return (lottery.lottery_price + (lottery.primitive_price || 0) + lottery.donation_price).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 mr-3" style={{color: 'rgb(48,80,105)'}} />
              <h1 className="text-3xl font-bold" style={{color: 'rgb(48,80,105)'}}>
                {t('lottery_admin_title')}
              </h1>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="inline-flex items-center px-3 py-1.5 bg-white text-[rgb(48,80,105)] border-3 border-[rgb(48,80,105)] rounded-xl hover:bg-[rgb(48,80,105)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[rgb(48,80,105)] focus:ring-offset-2 transition-all text-sm font-medium"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              {t('lottery_new_lottery')}
            </button>
          </div>

          {/* Formulario */}
          {showForm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">
              {editingLottery ? t('lottery_edit_lottery') : t('lottery_create_lottery')}
            </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                      {t('lottery_date')} *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                      {t('lottery_name')} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t('lottery_name_placeholder')}
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="special"
                    checked={formData.special}
                    onChange={(e) => {
                      const isSpecial = e.target.checked;
                      setFormData({
                        ...formData,
                        special: isSpecial,
                        lottery_price: isSpecial ? '2.50' : '0.50',
                        primitive_price: isSpecial ? '' : '0.30',
                        donation_price: isSpecial ? '0.50' : '0.20'
                      });
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="special" className="ml-2 text-sm font-medium text-blue-700">
                      {t('lottery_special_lottery')}
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                      {t('lottery_lottery_price')} (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.lottery_price}
                      onChange={(e) => setFormData({...formData, lottery_price: e.target.value})}
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={formData.special}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                      {t('lottery_primitive_price')} (€) {!formData.special && '*'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required={!formData.special}
                      value={formData.primitive_price}
                      onChange={(e) => setFormData({...formData, primitive_price: e.target.value})}
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={formData.special}
                    />
                    {formData.special && (
                      <p className="text-xs text-blue-600 mt-1">
                        {t('lottery_no_primitive_special')}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                      {t('lottery_donation_price')} (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.donation_price}
                      onChange={(e) => setFormData({...formData, donation_price: e.target.value})}
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                      {t('lottery_prize_amount')} (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.prize_amount}
                      onChange={(e) => setFormData({...formData, prize_amount: e.target.value})}
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      Cantidad total premiada del sorteo
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                    className="px-6 py-2 border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50"
                  >
                    {t('lottery_cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? t('lottery_saving') : (editingLottery ? t('lottery_update') : t('lottery_create'))}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de Sorteos por Meses - Desplegable */}
          <div className="space-y-4">
            {groupLotteriesByMonth(lotteryDates).map(({ month, lotteries }) => (
              <div key={month} className="bg-white border border-blue-200 rounded-lg overflow-hidden">
                {/* Header del Mes */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => toggleMonth(month)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-blue-600">{month}</h3>
                      <p className="text-sm text-black">
                        {lotteries.length} {lotteries.length === 1 ? t('lotteriesCount') : t('lotteriesCountPlural')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {lotteries.filter(l => l.name).length > 0 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        {lotteries.filter(l => l.name).length} {t('lotteriesCountPlural')}
                      </span>
                    )}
                    <span className="text-blue-400">
                      {expandedMonths.has(month) ? '▼' : '▶'}
                    </span>
                  </div>
                </div>

                {/* Sorteos del Mes - Solo si está expandido */}
                {expandedMonths.has(month) && (
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {lotteries.map((lottery) => (
                        <div 
                          key={lottery.id} 
                          className={`border rounded-lg p-4 transition-all ${
                            lottery.special 
                              ? 'border-yellow-300 bg-yellow-50 hover:border-yellow-400' 
                              : 'border-blue-300 bg-blue-50 hover:border-blue-400'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold text-blue-900">
                              {getLotteryDisplayName(lottery)}
                            </h3>
                            {lottery.special && (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                                {t('lottery_special')}
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center text-blue-600">
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              <span>{formatDate(lottery.date)}</span>
                            </div>

                            <div className="border-t pt-2">
                              <h4 className="font-medium text-black mb-2">{t('lottery_prices')}</h4>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-black">{t('lottery_lottery_price')}:</span>
                                  <span className="font-medium">€{lottery.lottery_price.toFixed(2)}</span>
                                </div>
                                {lottery.primitive_price && (
                                  <div className="flex justify-between">
                                    <span className="text-black">{t('lottery_primitive_price')}:</span>
                                    <span className="font-medium">€{lottery.primitive_price.toFixed(2)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-black">{t('lottery_donation_price')}:</span>
                                  <span className="font-medium">€{lottery.donation_price.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t font-semibold text-black">
                                  <span>{t('lottery_total')}:</span>
                                  <span>€{calculateTotal(lottery)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t font-semibold text-green-600">
                                  <span>{t('lottery_prize_amount')}:</span>
                                  <span>€{lottery.prize_amount ? lottery.prize_amount.toFixed(2) : '0.00'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center text-black">
                              <UserGroupIcon className="h-4 w-4 mr-2" />
                              <span className="text-sm">{t('lottery_manage_tickets')}</span>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => editLottery(lottery)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title={t('edit')}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => managePrizes(lottery)}
                                className="text-green-600 hover:text-green-800 p-1"
                                title={t('lottery_prize_amount')}
                              >
                                <CurrencyDollarIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteLottery(lottery)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title={t('delete')}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {lotteryDates.length === 0 && (
            <div className="text-center py-12">
              <CurrencyDollarIcon className="h-16 w-16 mx-auto mb-4" style={{color: 'rgb(48,80,105)'}} />
              <h3 className="text-xl font-semibold text-black mb-2">
                {t('lottery.no_lotteries')}
              </h3>
              <p className="text-black">
                {t('lottery.no_lotteries_admin_desc')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

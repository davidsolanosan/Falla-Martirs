import React, { useState, useEffect } from 'react';
import { useTranslation } from '../lib/i18n';
import { useSupabase } from '../lib/SupabaseContext';
import { LotteryDate, LotteryTicket } from '../lib/supabase';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CalendarIcon, 
  CurrencyEuroIcon,
  TrophyIcon,
  UserGroupIcon,
  CheckIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface FormData {
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
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLottery, setEditingLottery] = useState<LotteryDate | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPrizes, setShowPrizes] = useState(false);
  const [selectedLotteryForPrizes, setSelectedLotteryForPrizes] = useState<LotteryDate | null>(null);
  const [prizes, setPrizes] = useState<any[]>([]);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<FormData>({
    date: '',
    name: '',
    special: false,
    lottery_price: '0.50',
    primitive_price: '0.30',
    donation_price: '0.20',
    prize_amount: '0'
  });

  useEffect(() => {
    loadLotteryDates();
  }, []);

  const loadLotteryDates = async () => {
    try {
      setLoading(true);
      await refreshLotteryDates();
    } catch (error) {
      console.error('Error cargando sorteos:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      name: '',
      special: false,
      lottery_price: editingLottery?.special ? '2.50' : '0.50',
      primitive_price: editingLottery?.special ? '' : '0.30',
      donation_price: editingLottery?.special ? '0.50' : '0.20',
      prize_amount: editingLottery?.prize_amount ? editingLottery.prize_amount.toString() : '0'
    });
    setEditingLottery(null);
    setShowForm(false);
  };

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
        prize_amount: parseFloat(formData.prize_amount)
      };

      if (editingLottery) {
        // Actualizar sorteo existente
        const { error } = await supabase
          .from('lottery_dates')
          .update(lotteryData)
          .eq('id', editingLottery.id);
        
        if (error) {
          console.error('Error actualizando sorteo:', error);
          alert('Error actualizando sorteo: ' + error.message);
        } else {
          alert('Sorteo actualizado exitosamente');
          resetForm();
          await refreshLotteryDates();
        }
      } else {
        // Crear nuevo sorteo
        const { error } = await supabase
          .from('lottery_dates')
          .insert([lotteryData]);
        
        if (error) {
          console.error('Error creando sorteo:', error);
          alert('Error creando sorteo: ' + error.message);
        } else {
          alert('Sorteo creado exitosamente');
          resetForm();
          await refreshLotteryDates();
        }
      }
    } catch (error) {
      console.error('Error general:', error);
      alert('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const editLottery = (lottery: LotteryDate) => {
    setEditingLottery(lottery);
    setFormData({
      date: lottery.date,
      name: lottery.name,
      special: lottery.special,
      lottery_price: lottery.lottery_price.toString(),
      primitive_price: lottery.primitive_price?.toString() || '',
      donation_price: lottery.donation_price.toString(),
      prize_amount: lottery.prize_amount ? lottery.prize_amount.toString() : '0'
    });
    setShowForm(true);
  };

  const deleteLottery = async (lottery: LotteryDate) => {
    if (!confirm(`¿Estás seguro de eliminar el sorteo "${lottery.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('lottery_dates')
        .delete()
        .eq('id', lottery.id);
      
      if (error) {
        console.error('Error eliminando sorteo:', error);
        alert('Error eliminando sorteo: ' + error.message);
      } else {
        alert('Sorteo eliminado exitosamente');
        await refreshLotteryDates();
      }
    } catch (error) {
      console.error('Error general:', error);
      alert('Error: ' + error.message);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const calculateTotal = (lottery: LotteryDate) => {
    let total = lottery.lottery_price + lottery.donation_price;
    if (lottery.primitive_price) {
      total += lottery.primitive_price;
    }
    return total.toFixed(2);
  };

  const loadPrizes = async (lotteryId: string) => {
    try {
      const { data, error } = await supabase
        .from('lottery_prizes')
        .select('*')
        .eq('lottery_date_id', lotteryId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error cargando premios:', error);
        return;
      }
      
      setPrizes(data || []);
    } catch (error) {
      console.error('Error general cargando premios:', error);
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

  const groupLotteriesByMonth = (lotteries: LotteryDate[]) => {
    const months: { [key: string]: LotteryDate[] } = {};
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
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
      
      if (parseInt(yearA) !== parseInt(yearB)) {
        return parseInt(yearA) - parseInt(yearB);
      }
      return monthIndexA - monthIndexB;
    });
    
    return sortedMonths.map(month => ({
      month,
      lotteries: months[month]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-purple-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <TrophyIcon className="h-8 w-8 text-purple-600 mr-3" />
              <h1 className="text-3xl font-bold text-purple-800">
                {t('lottery_admin_title')}
              </h1>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              {t('lottery_new_lottery')}
            </button>
          </div>

          {/* Formulario */}
          {showForm && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-purple-800 mb-4">
              {editingLottery ? t('lottery_edit_lottery') : t('lottery_create_lottery')}
            </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-700 mb-1">
                      {t('lottery_date')} *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-700 mb-1">
                      {t('lottery_name')} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t('lottery_name_placeholder')}
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="w-4 h-4 text-purple-600"
                  />
                  <label htmlFor="special" className="ml-2 text-sm font-medium text-purple-700">
                      {t('lottery_special_lottery')}
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-700 mb-1">
                      {t('lottery_lottery_price')} (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.lottery_price}
                      onChange={(e) => setFormData({...formData, lottery_price: e.target.value})}
                      className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={formData.special}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-700 mb-1">
                      {t('lottery_primitive_price')} (€) {!formData.special && '*'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required={!formData.special}
                      value={formData.primitive_price}
                      onChange={(e) => setFormData({...formData, primitive_price: e.target.value})}
                      className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={formData.special}
                    />
                    {formData.special && (
                      <p className="text-xs text-purple-600 mt-1">
                        {t('lottery_no_primitive_special')}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-700 mb-1">
                      {t('lottery_donation_price')} (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.donation_price}
                      onChange={(e) => setFormData({...formData, donation_price: e.target.value})}
                      className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-700 mb-1">
                      {t('lottery_prize_amount')} (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.prize_amount}
                      onChange={(e) => setFormData({...formData, prize_amount: e.target.value})}
                      className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-purple-600 mt-1">
                      Cantidad total premiada del sorteo
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-purple-300 rounded-lg text-purple-700 hover:bg-purple-50"
                  >
                    {t('lottery_cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {submitting ? t('lottery_saving') : (editingLottery ? t('lottery_update') : t('lottery_create'))}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Gestión de Premios */}
          {showPrizes && selectedLotteryForPrizes && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-green-800">
                  {t('lottery_prize_amount')} - {selectedLotteryForPrizes.name}
                </h2>
                <button
                  onClick={() => setShowPrizes(false)}
                  className="text-green-600 hover:text-green-800"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Lista de Premios Existentes */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-green-700 mb-3">
                  {t('lottery_prize_amount')} {t('lottery_lottery_numbers')}
                </h3>
                {prizes.length === 0 ? (
                  <p className="text-green-600 text-sm">
                    No hay premios registrados para este sorteo
                  </p>
                ) : (
                  <div className="space-y-3">
                    {prizes.map((prize) => (
                      <div key={prize.id} className="bg-white border border-green-300 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-green-900">
                              {prize.prize_category}
                            </h4>
                            <p className="text-green-700 text-sm mt-1">
                              {prize.description}
                            </p>
                            <div className="mt-2 space-y-1">
                              <div className="text-sm text-green-600">
                                <strong>{t('lottery_prize_amount')}:</strong> {prize.prize_amount.toFixed(2)}
                              </div>
                              {prize.winning_number && (
                                <div className="text-sm text-blue-600">
                                  <strong>{t('lottery_lottery_number_to_play')}:</strong> 
                                  <span className="ml-1 font-bold bg-blue-100 px-2 py-1 rounded">
                                    {prize.winning_number}
                                  </span>
                                </div>
                              )}
                              {prize.winning_numbers && prize.winning_numbers.length > 0 && (
                                <div className="text-sm text-blue-600">
                                  <strong>{t('lottery_primitive_numbers')}:</strong> 
                                  <span className="ml-1 font-bold bg-blue-100 px-2 py-1 rounded">
                                    {prize.winning_numbers.join('-')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800 p-1">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-800 p-1">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón para añadir nuevo premio */}
              <div className="text-center">
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center mx-auto">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  {t('lottery_new_lottery')} {t('lottery_prize_amount')}
                </button>
              </div>
            </div>
          )}

          {/* Lista de Sorteos por Meses - Desplegable */}
          <div className="space-y-4">
            {groupLotteriesByMonth(lotteryDates).map(({ month, lotteries }) => (
              <div key={month} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Header del Mes - Desplegable */}
                <div 
                  className="bg-gray-50 border-b border-gray-200 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleMonth(month)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      {expandedMonths.has(month) ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-600 mr-2" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 text-gray-600 mr-2" />
                      )}
                      <h2 className="text-base font-bold text-gray-800">
                        {month}
                      </h2>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-xs text-gray-600">
                        {lotteries.length} {lotteries.length === 1 ? t('lottery_draw') : t('lottery_draws')}
                      </div>
                      {lotteries.some(l => l.prize_amount && l.prize_amount > 0) && (
                        <div className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                          {t('lottery_prize_amount')}: {lotteries.reduce((sum, l) => sum + (l.prize_amount || 0), 0).toFixed(2)}
                        </div>
                      )}
                    </div>
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
                              : 'border-purple-300 bg-purple-50 hover:border-purple-400'
                          }`}
                        >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-purple-900">
                    {lottery.name}
                  </h3>
                  {lottery.special && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                      {t('lottery_special')}
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-purple-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>{formatDate(lottery.date)}</span>
                  </div>

                  <div className="border-t pt-2">
                    <h4 className="font-medium text-purple-800 mb-2">{t('lottery_prices')}</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-purple-600">{t('lottery_lottery_price')}:</span>
                        <span className="font-medium">€{lottery.lottery_price.toFixed(2)}</span>
                      </div>
                      {lottery.primitive_price && (
                        <div className="flex justify-between">
                          <span className="text-purple-600">{t('lottery_primitive_price')}:</span>
                          <span className="font-medium">€{lottery.primitive_price.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-purple-600">{t('lottery_donation_price')}:</span>
                        <span className="font-medium">EUR{lottery.donation_price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-semibold text-purple-900">
                        <span>{t('lottery_total')}:</span>
                        <span>EUR{calculateTotal(lottery)}</span>
                      </div>
                      {lottery.prize_amount && lottery.prize_amount > 0 && (
                        <div className="flex justify-between pt-2 border-t font-semibold text-green-600">
                          <span>{t('lottery_prize_amount')}:</span>
                          <span>EUR{lottery.prize_amount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-purple-600">
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
                        <TrophyIcon className="h-4 w-4" />
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
              <TrophyIcon className="h-16 w-16 text-purple-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-purple-900 mb-2">
                {t('lottery.no_lotteries')}
              </h3>
              <p className="text-purple-600">
                {t('lottery.no_lotteries_admin_desc')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

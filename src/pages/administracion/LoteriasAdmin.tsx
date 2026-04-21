import React, { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useSupabase } from '../../lib/SupabaseContext';
import { ChevronDownIcon, ChevronUpIcon, Edit2, Trash2, Plus, Ticket } from 'lucide-react';

interface LotteryDate {
  date: string;
  name: string;
  special?: boolean;
}

interface MonthLotteries {
  month: string;
  dates: LotteryDate[];
  isOpen: boolean;
}

export default function LoteriasAdmin() {
  const { t } = useTranslation();
  
  // Estructura de loterías por mes - Año fallero: abril a marzo
  const [months, setMonths] = useState<MonthLotteries[]>([
    {
      month: t('april'),
      isOpen: false,
      dates: [
        { date: '2025-04-05', name: '' },
        { date: '2025-04-12', name: '' },
        { date: '2025-04-19', name: '' },
        { date: '2025-04-26', name: '' }
      ]
    },
    {
      month: t('may'),
      isOpen: false,
      dates: [
        { date: '2025-05-03', name: '' },
        { date: '2025-05-10', name: '' },
        { date: '2025-05-17', name: '' },
        { date: '2025-05-24', name: '' },
        { date: '2025-05-31', name: '' }
      ]
    },
    {
      month: t('june'),
      isOpen: false,
      dates: [
        { date: '2025-06-07', name: '' },
        { date: '2025-06-14', name: '' },
        { date: '2025-06-21', name: '' },
        { date: '2025-06-28', name: '' }
      ]
    },
    {
      month: t('july'),
      isOpen: false,
      dates: [
        { date: '2025-07-05', name: '' },
        { date: '2025-07-12', name: '' },
        { date: '2025-07-19', name: '' },
        { date: '2025-07-26', name: '' }
      ]
    },
    {
      month: t('august'),
      isOpen: false,
      dates: [
        { date: '2025-08-02', name: '' },
        { date: '2025-08-09', name: '' },
        { date: '2025-08-16', name: '' },
        { date: '2025-08-23', name: '' },
        { date: '2025-08-30', name: '' }
      ]
    },
    {
      month: t('september'),
      isOpen: false,
      dates: [
        { date: '2025-09-06', name: '' },
        { date: '2025-09-13', name: '' },
        { date: '2025-09-20', name: '' },
        { date: '2025-09-27', name: '' }
      ]
    },
    {
      month: t('october'),
      isOpen: false,
      dates: [
        { date: '2025-10-04', name: '' },
        { date: '2025-10-11', name: '' },
        { date: '2025-10-18', name: '' },
        { date: '2025-10-25', name: '' }
      ]
    },
    {
      month: t('november'),
      isOpen: false,
      dates: [
        { date: '2025-11-01', name: '' },
        { date: '2025-11-08', name: '' },
        { date: '2025-11-15', name: '' },
        { date: '2025-11-22', name: '' },
        { date: '2025-11-29', name: '' }
      ]
    },
    {
      month: t('december'),
      isOpen: false,
      dates: [
        { date: '2025-12-06', name: '' },
        { date: '2025-12-13', name: '' },
        { date: '2025-12-20', name: '' },
        { date: '2025-12-27', name: '' }
      ]
    },
    {
      month: t('january'),
      isOpen: false,
      dates: [
        { date: '2026-01-03', name: '' },
        { date: '2026-01-10', name: '' },
        { date: '2026-01-17', name: '' },
        { date: '2026-01-24', name: '' },
        { date: '2026-01-31', name: '' }
      ]
    },
    {
      month: t('february'),
      isOpen: false,
      dates: [
        { date: '2026-02-07', name: '' },
        { date: '2026-02-14', name: '' },
        { date: '2026-02-21', name: '' },
        { date: '2026-02-28', name: '' }
      ]
    },
    {
      month: t('march'),
      isOpen: false,
      dates: [
        { date: '2026-03-07', name: '' },
        { date: '2026-03-14', name: '' },
        { date: '2026-03-21', name: '' },
        { date: '2026-03-28', name: '' }
      ]
    }
  ]);

  // Estado para el modal de edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLottery, setEditingLottery] = useState<{monthIndex: number, dateIndex: number, lottery: LotteryDate} | null>(null);

  // Función para formatear fecha a dd/mm/aaaa
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Función para formatear día de la semana
  const formatDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { weekday: 'long' });
  };

  // Toggle para abrir/cerrar meses
  const toggleMonth = (monthIndex: number) => {
    setMonths(prev => prev.map((month, index) => 
      index === monthIndex ? { ...month, isOpen: !month.isOpen } : month
    ));
  };

  // Abrir modal de edición
  const openEditModal = (monthIndex: number, dateIndex: number, lottery: LotteryDate) => {
    setEditingLottery({ monthIndex, dateIndex, lottery });
    setIsModalOpen(true);
  };

  // Guardar cambios
  const handleSaveLottery = (lotteryData: LotteryDate) => {
    if (editingLottery) {
      setMonths(prev => prev.map((month, index) => 
        index === editingLottery.monthIndex 
          ? {
              ...month,
              dates: month.dates.map((date, dateIndex) => 
                dateIndex === editingLottery.dateIndex ? lotteryData : date
              )
            }
          : month
      ));
    }
    setIsModalOpen(false);
    setEditingLottery(null);
  };

  // Eliminar lotería
  const handleDeleteLottery = (monthIndex: number, dateIndex: number) => {
    if (window.confirm(t('confirmDeleteLottery'))) {
      setMonths(prev => prev.map((month, index) => 
        index === monthIndex 
          ? {
              ...month,
              dates: month.dates.map((date, dateIndex) => 
                dateIndex === dateIndex ? { ...date, name: '', special: false } : date
              )
            }
          : month
      ));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Ticket className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{t('navAdminLottery')}</h1>
                <p className="text-sm text-slate-500">{t('manageLotteries')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm text-slate-500">{t('totalLotteries')}</p>
                <p className="text-2xl font-bold text-slate-800">
                  {months.reduce((total, month) => total + month.dates.filter(d => d.name).length, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Meses */}
        <div className="space-y-4">
          {months.map((month, monthIndex) => (
            <div key={monthIndex} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Header del Mes */}
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleMonth(monthIndex)}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-slate-800">{month.month}</h3>
                    <p className="text-sm text-slate-500">
                      {month.dates.length} {month.dates.length === 1 ? t('lotteriesCount') : t('lotteriesCountPlural')}
                      {month.dates.some(d => d.name) && ` ${t('activeLotteries')}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {month.dates.filter(d => d.name).length > 0 && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      {month.dates.filter(d => d.name).length} {t('active')}
                    </span>
                  )}
                  {month.isOpen ? (
                    <ChevronUpIcon className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Lista de Loterías del Mes */}
              {month.isOpen && (
                <div className="border-t border-slate-100 p-4">
                  <div className="space-y-3">
                    {month.dates.map((lottery, dateIndex) => (
                      <div key={dateIndex} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-xs text-slate-500 uppercase">{formatDayOfWeek(lottery.date)}</p>
                            <p className="text-lg font-bold text-slate-800">{formatDate(lottery.date)}</p>
                          </div>
                          <div>
                            {lottery.name ? (
                              <div>
                                <p className="font-medium text-slate-800">{lottery.name}</p>
                                {lottery.special && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    {t('special')}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-400 italic">{t('noLottery')}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(monthIndex, dateIndex, lottery)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={t('edit')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {lottery.name && (
                            <button
                              onClick={() => handleDeleteLottery(monthIndex, dateIndex)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={t('delete')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal de Edición */}
        {isModalOpen && editingLottery && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  {editingLottery.lottery.name ? t('editLottery') : t('addLottery')}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <ChevronUpIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('date')}
                  </label>
                  <input
                    type="text"
                    value={formatDate(editingLottery.lottery.date)}
                    disabled
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('lotteryName')}
                  </label>
                  <input
                    type="text"
                    value={editingLottery.lottery.name}
                    onChange={(e) => setEditingLottery({
                      ...editingLottery,
                      lottery: { ...editingLottery.lottery, name: e.target.value }
                    })}
                    placeholder={t('enterLotteryName')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="special"
                    checked={editingLottery.lottery.special || false}
                    onChange={(e) => setEditingLottery({
                      ...editingLottery,
                      lottery: { ...editingLottery.lottery, special: e.target.checked }
                    })}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="special" className="ml-2 text-sm text-slate-700">
                    {t('specialLottery')}
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={() => handleSaveLottery(editingLottery.lottery)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                >
                  {t('save')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

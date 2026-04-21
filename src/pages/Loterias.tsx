import React, { useState } from 'react';
import { useTranslation } from '../lib/i18n';
import { useSupabase } from '../lib/SupabaseContext';
import { hasPermission } from '../lib/permissions';
import { ChevronDownIcon, ChevronUpIcon, CalendarIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

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

interface LotteryDetails {
  date: string;
  name: string;
  special?: boolean;
  lotteryNumber: string;
  lotteryAmount: string;
  primitiveNumber: string;
  primitiveAmount: string;
  donationAmount: string;
  salePrice: string;
  prizePerTicket: string;
}

export default function Loterias() {
  const { t } = useTranslation();
  const { user } = useSupabase();
  
  // Estado para el modal de administración
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLottery, setSelectedLottery] = useState<LotteryDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Verificar permisos reales del usuario con protección para null
  const canEditLotteries = user ? hasPermission(user.role, 'loterias') : false;
  
  // Función para formatear fecha a dd/mm/aaaa
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  // Función para abrir modal de edición
  const openEditModal = (lottery: any) => {
    const details: LotteryDetails = {
      date: lottery.date,
      name: lottery.name || formatDate(lottery.date),
      special: lottery.special || false,
      lotteryNumber: '',
      lotteryAmount: '',
      primitiveNumber: '',
      primitiveAmount: '',
      donationAmount: '',
      salePrice: '',
      prizePerTicket: ''
    };
    setSelectedLottery(details);
    setIsEditing(true);
    setIsModalOpen(true);
  };
  
  // Función para cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLottery(null);
    setIsEditing(false);
  };
  
  // Función para guardar cambios
  const saveChanges = () => {
    // TODO: Implementar guardado en base de datos
    console.log('Guardando cambios:', selectedLottery);
    closeModal();
  };
  
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
        { date: '2025-12-22', name: t('lotteryChristmas'), special: true }
      ]
    },
    {
      month: t('january'),
      isOpen: false,
      dates: [
        { date: '2025-01-06', name: t('lotteryChild'), special: true }
      ]
    },
    {
      month: t('february'),
      isOpen: false,
      dates: [
        { date: '2025-02-01', name: '' },
        { date: '2025-02-08', name: '' },
        { date: '2025-02-15', name: '' },
        { date: '2025-02-22', name: '' }
      ]
    },
    {
      month: t('march'),
      isOpen: false,
      dates: [
        { date: '2025-03-01', name: '' },
        { date: '2025-03-08', name: '' },
        { date: '2025-03-15', name: '' },
        { date: '2025-03-22', name: '' },
        { date: '2025-03-29', name: '' }
      ]
    }
  ]);

  const toggleMonth = (index: number) => {
    setMonths(prev => prev.map((month, i) => 
      i === index ? { ...month, isOpen: !month.isOpen } : month
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">{t('lotteryTitle')}</h1>
        <p className="text-slate-600">{t('lotteryDescription')}</p>
      </div>

      {/* Lista de meses con desplegables */}
      <div className="max-w-4xl mx-auto space-y-4">
        {months.map((month, index) => (
          <div key={month.month} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header del mes - Click para desplegar/contraer */}
            <button
              onClick={() => toggleMonth(index)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-slate-800">{month.month}</h3>
                  <p className="text-sm text-slate-500">
                    {month.dates.length} {month.dates.length === 1 ? t('lotteriesCount') : t('lotteriesCountPlural')}
                    {month.dates.some(d => d.special) && ` ${t('lotterySpecialCount')}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-500">
                  {month.isOpen ? t('closeMonth') : t('openMonth')}
                </span>
                {month.isOpen ? (
                  <ChevronUpIcon className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </button>

            {/* Contenido desplegable - Fechas de lotería */}
            {month.isOpen && (
              <div className="border-t border-slate-100 bg-slate-50">
                <div className="p-4 space-y-3">
                  {month.dates.map((lottery, lotteryIndex) => (
                    <div
                      key={lottery.date}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                        lottery.special
                          ? 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200'
                          : 'bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          lottery.special
                            ? 'bg-red-100 text-red-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          <CalendarIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className={`font-medium ${
                            lottery.special
                              ? 'text-red-700'
                              : 'text-slate-800'
                          }`}>
                            {lottery.name || formatDate(lottery.date)}
                          </h4>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {lottery.special && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            {t('lotterySpecial')}
                          </span>
                        )}
                        <button className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                          {t('viewDetails')}
                        </button>
                        {canEditLotteries && (
                          <button
                            onClick={() => openEditModal(lottery)}
                            className="px-3 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors"
                            title={t('lotteryAdmin')}
                          >
                            <PencilIcon className="w-4 h-4" />
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
      
      {/* Modal de edición de lotería - Solo para administradores */}
      {isModalOpen && selectedLottery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">
                {isEditing ? t('editLottery') : t('lotteryDetails')}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            {/* Contenido del modal */}
            <div className="p-6 space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('lotteryNumber')}
                  </label>
                  <input
                    type="text"
                    value={selectedLottery.lotteryNumber}
                    onChange={(e) => setSelectedLottery({...selectedLottery, lotteryNumber: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: 12345"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('lotteryAmount')}
                  </label>
                  <input
                    type="text"
                    value={selectedLottery.lotteryAmount}
                    onChange={(e) => setSelectedLottery({...selectedLottery, lotteryAmount: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: 1000"
                  />
                </div>
              </div>
              
              {/* Primitiva */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('primitiveNumber')}
                  </label>
                  <input
                    type="text"
                    value={selectedLottery.primitiveNumber}
                    onChange={(e) => setSelectedLottery({...selectedLottery, primitiveNumber: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: 67890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('primitiveAmount')}
                  </label>
                  <input
                    type="text"
                    value={selectedLottery.primitiveAmount}
                    onChange={(e) => setSelectedLottery({...selectedLottery, primitiveAmount: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: 500"
                  />
                </div>
              </div>
              
              {/* Donativo y precios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('donationAmount')}
                  </label>
                  <input
                    type="text"
                    value={selectedLottery.donationAmount}
                    onChange={(e) => setSelectedLottery({...selectedLottery, donationAmount: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: 2.50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('salePrice')}
                  </label>
                  <input
                    type="text"
                    value={selectedLottery.salePrice}
                    onChange={(e) => setSelectedLottery({...selectedLottery, salePrice: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: 20.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('prizePerTicket')}
                  </label>
                  <input
                    type="text"
                    value={selectedLottery.prizePerTicket}
                    onChange={(e) => setSelectedLottery({...selectedLottery, prizePerTicket: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: 100.00"
                  />
                </div>
              </div>
              
              {/* Información de la lotería */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {t('lotteryDetails')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-600">Fecha:</span>
                    <span className="text-slate-800 ml-2">{selectedLottery.date}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Nombre:</span>
                    <span className="text-slate-800 ml-2">{selectedLottery.name}</span>
                  </div>
                  {selectedLottery.special && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-slate-600">Tipo:</span>
                      <span className="text-red-600 ml-2 font-medium">{t('lotterySpecial')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Footer del modal */}
            <div className="flex items-center justify-end gap-4 p-6 border-t border-slate-200">
              <button
                onClick={closeModal}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {t('cancelLottery')}
              </button>
              <button
                onClick={saveChanges}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                {t('saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

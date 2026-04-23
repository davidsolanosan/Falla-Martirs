import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../lib/i18n';
import { Ticket, Plus } from 'lucide-react';

export default function Loteria() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isLotteryModalOpen, setIsLotteryModalOpen] = useState(false);
  const isAdmin = user?.role === 'admin' || user?.role === 'master_admin';
  
  // Mock lottery data (temporal)
  const lotteries = [
    {
      id: '1',
      name: 'Lotería de Navidad',
      description: 'Participación en el sorteo de Navidad',
      price: 20,
      totalTickets: 100,
      availableTickets: 45,
      assignedToFamily: {},
      soldByFamily: {}
    },
    {
      id: '2',
      name: 'Lotería del Niño',
      description: 'Participación en el sorteo del Niño',
      price: 15,
      totalTickets: 50,
      availableTickets: 23,
      assignedToFamily: {},
      soldByFamily: {}
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{isAdmin ? t('navLottery') : t('navMyLottery')}</h2>
        {isAdmin && (
          <button 
            onClick={() => setIsLotteryModalOpen(true)}
            className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('newLottery')}
          </button>
        )}
      </div>

      {/* Lista de Loterías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lotteries.map((lottery) => (
          <div key={lottery.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Ticket className="w-6 h-6 text-indigo-600" />
                </div>
                <span className="text-2xl font-bold text-indigo-600">¥{lottery.price}</span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{lottery.name}</h3>
              <p className="text-gray-600 mb-4">{lottery.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('totalTickets')}:</span>
                  <span className="font-medium">{lottery.totalTickets}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Disponibles:</span>
                  <span className="font-medium text-green-600">{lottery.availableTickets}</span>
                </div>
              </div>
              
              <button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Participar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal temporal - solo placeholder */}
      {isLotteryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">{t('newLottery')}</h3>
            <p className="text-gray-600 mb-4">Formulario de lotería en construcción...</p>
            <button
              onClick={() => setIsLotteryModalOpen(false)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

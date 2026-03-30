import React, { useState } from 'react';
import { useData } from '../lib/DataContext';
import { useTranslation } from '../lib/i18n';
import { Ticket, Plus } from 'lucide-react';
import { LotteryFormModal } from '../components/forms/LotteryFormModal';

export default function Loteria() {
  const { lotteries, families, currentUser } = useData();
  const { t } = useTranslation();
  const [isLotteryModalOpen, setIsLotteryModalOpen] = useState(false);
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'directiva';
  
  const displayFamilies = isAdmin ? families : families.filter(f => f.id === currentUser.familyId);

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

      {lotteries.map(lottery => {
        const totalAssigned = isAdmin 
          ? Object.values(lottery.assignedToFamily).reduce((a: number, b: number) => a + b, 0) as number
          : (currentUser.familyId ? (lottery.assignedToFamily[currentUser.familyId] || 0) : 0);
        const totalSold = isAdmin
          ? Object.values(lottery.soldByFamily).reduce((a: number, b: number) => a + b, 0) as number
          : (currentUser.familyId ? (lottery.soldByFamily[currentUser.familyId] || 0) : 0);
        const progress = totalAssigned > 0 ? Math.round((totalSold / totalAssigned) * 100) : 0;

        return (
          <div key={lottery.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl mr-4">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{lottery.name}</h3>
                    <p className="text-sm text-slate-500">{t('totalTickets')}: {lottery.totalTickets}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">{progress}%</p>
                  <p className="text-sm text-slate-500">{t('soldUpper')}</p>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div className="bg-indigo-500 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="flex justify-between mt-2 text-sm font-medium text-slate-600">
                <span>{totalSold} {t('sold')}</span>
                <span>{(totalAssigned as number) - (totalSold as number)} {t('toSell')}</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {displayFamilies.map(family => {
                const assigned = lottery.assignedToFamily[family.id] || 0;
                const sold = lottery.soldByFamily[family.id] || 0;
                if (assigned === 0) return null;

                return (
                  <div key={family.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-800">{family.name}</h4>
                      <p className="text-sm text-slate-500">{t('assigned')}: {assigned}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right mr-4">
                        <p className="text-lg font-bold text-slate-800">{sold}</p>
                        <p className="text-xs text-slate-500 uppercase font-bold">{t('soldUpper')}</p>
                      </div>
                      {isAdmin && (
                        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg transition-colors">
                          {t('update')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <LotteryFormModal isOpen={isLotteryModalOpen} onClose={() => setIsLotteryModalOpen(false)} />
    </div>
  );
}

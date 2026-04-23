import React, { useState, useEffect } from 'react';
import { useTranslation } from '../lib/i18n';
import { useSupabase } from '../lib/SupabaseContext';
import { LotteryDate, LotteryTicket } from '../lib/supabase';
import { CalendarIcon, TrophyIcon, UserIcon, CurrencyEuroIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function LoteriasUser() {
  const { t } = useTranslation();
  const { lotteryDates, refreshLotteryDates } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [selectedLottery, setSelectedLottery] = useState<LotteryDate | null>(null);
  const [userTickets, setUserTickets] = useState<LotteryTicket[]>([]);
  const [showTickets, setShowTickets] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const calculateTotal = (lottery: LotteryDate) => {
    let total = lottery.lottery_price;
    if (lottery.primitive_price) {
      total += lottery.primitive_price;
    }
    total += lottery.donation_price;
    return total.toFixed(2);
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

  const loadUserTickets = async (lotteryId: string) => {
    try {
      const exampleTickets: LotteryTicket[] = [
        {
          id: '1',
          lottery_date_id: lotteryId,
          lottery_number: '12345',
          primitive_numbers: ['12', '34', '56'],
          is_paid: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          lottery_date_id: lotteryId,
          lottery_number: '67890',
          primitive_numbers: ['78', '90'],
          is_paid: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setUserTickets(exampleTickets);
    } catch (error) {
      console.error('Error cargando papeletas:', error);
    }
  };

  const groupLotteriesByMonth = (lotteries: LotteryDate[]) => {
    const months: { [key: string]: LotteryDate[] } = {};
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    lotteries.forEach(lottery => {
      const date = new Date(lottery.date);
      const monthName = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const monthKey = `${monthName} ${year}`;
      
      if (!months[monthKey]) {
        months[monthKey] = [];
      }
      months[monthKey].push(lottery);
    });
    
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center">
            <TrophyIcon className="h-6 w-6 mr-2" style={{color: 'rgb(48,80,105)'}} />
            <h1 className="text-xl font-bold" style={{color: 'rgb(48,80,105)'}}>{t('lottery_title')}</h1>
          </div>
        </div>

        <div className="space-y-4">
          {groupLotteriesByMonth(lotteryDates).map(({ month, lotteries }) => (
            <div key={month} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                style={{borderBottom: '1px solid rgb(48,80,105)', backgroundColor: 'rgb(248,250,252)'}}
                onClick={() => toggleMonth(month)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {expandedMonths.has(month) ? (
                      <ChevronDownIcon className="h-5 w-5 text-gray-600 mr-2" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5 text-gray-600 mr-2" />
                    )}
                    <h2 className="text-base font-bold" style={{color: 'rgb(48,80,105)'}}>
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

              {expandedMonths.has(month) && (
                <div className="divide-y" style={{borderTopColor: 'rgb(48,80,105)'}}>
                  {lotteries.map((lottery) => (
                    <div 
                      key={lottery.id} 
                      className={`p-3 cursor-pointer transition-all ${
                        lottery.special 
                          ? 'bg-amber-50 hover:bg-amber-100' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedLottery(lottery);
                        setShowTickets(false);
                        loadUserTickets(lottery.id);
                      }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <h3 className="text-base font-semibold text-gray-900">
                            {lottery.name}
                          </h3>
                          {lottery.special && (
                            <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                              {t('lottery_special')}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-600">{formatDate(lottery.date)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-2">
                        <div className="flex flex-col space-y-1">
                          <span>Lotería: {lottery.lottery_price.toFixed(2)}</span>
                          {lottery.primitive_price && (
                            <span>Primitiva: {lottery.primitive_price.toFixed(2)}</span>
                          )}
                          <span>Donación: {lottery.donation_price.toFixed(2)}</span>
                        </div>
                        <div className="font-semibold text-gray-800 text-right">
                          Total: {calculateTotal(lottery)}
                        </div>
                      </div>

                      <div className="flex justify-between pt-2 border-t font-semibold text-green-600">
                        <span>{t('lottery_prize_amount')}:</span>
                        <span>€{lottery.prize_amount ? lottery.prize_amount.toFixed(2) : '0.00'}</span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <div className="flex items-center text-xs text-gray-600">
                          <UserIcon className="h-3 w-3 mr-1" />
                          <span>{userTickets.filter(t => t.lottery_date_id === lottery.id).length} papeletas</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLottery(lottery);
                            setShowTickets(!showTickets);
                            loadUserTickets(lottery.id);
                          }}
                          className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                        >
                          {showTickets && selectedLottery?.id === lottery.id ? 'Ocultar' : 'Ver'}
                        </button>
                      </div>

                      {showTickets && selectedLottery?.id === lottery.id && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          {userTickets.length === 0 ? (
                            <p className="text-xs text-gray-500 text-center py-2">
                              {t('lottery_no_tickets_assigned')}
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {userTickets.map((ticket) => (
                                <div key={ticket.id} className="bg-gray-50 border border-gray-200 rounded p-2">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-bold text-sm px-2 py-0.5 rounded" style={{color: 'rgb(48,80,105)', backgroundColor: 'rgb(239,246,255)'}}>
                                        {ticket.lottery_number}
                                      </span>
                                      {ticket.primitive_numbers && ticket.primitive_numbers.length > 0 && (
                                        <span className="text-xs px-1.5 py-0.5 rounded" style={{color: 'rgb(48,80,105)', backgroundColor: 'rgb(239,246,255)'}}>
                                          {ticket.primitive_numbers.join('-')}
                                        </span>
                                      )}
                                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                                        ticket.is_paid 
                                          ? 'bg-green-100 text-green-700' 
                                          : 'bg-yellow-100 text-yellow-700'
                                      }`}>
                                        {ticket.is_paid ? 'Pagado' : 'Pendiente'}
                                      </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <div className="text-xs text-gray-600">{calculateTotal(lottery)}</div>
                                      {ticket.prize_amount && ticket.prize_amount > 0 && (
                                        <div className="text-xs font-bold text-green-600">
                                          +{ticket.prize_amount.toFixed(2)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {lotteryDates.length === 0 && (
          <div className="text-center py-8">
            <TrophyIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {t('lottery_no_lotteries')}
            </h3>
            <p className="text-gray-500 text-sm">
              {t('lottery_no_lotteries_desc')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

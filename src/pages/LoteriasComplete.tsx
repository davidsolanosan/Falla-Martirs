import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../lib/i18n';
import { supabase } from '../lib/supabase';
import { 
  ChevronDownIcon, 
  ChevronRightIcon, 
  GiftIcon, 
  CalendarIcon,
  TicketIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface LotteryDate {
  id: string;
  date: string;
  name: string;
  special: boolean;
  lottery_price: number;
  primitive_price?: number;
  donation_price: number;
  prize_amount?: number;
}

interface LotteryTicket {
  id: string;
  lottery_id: string;
  user_id: string;
  lottery_number: string;
  primitive_number?: string;
  is_paid: boolean;
  created_at: string;
}

export default function LoteriasComplete() {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const [lotteryDates, setLotteryDates] = useState<LotteryDate[]>([]);
  const [userTickets, setUserTickets] = useState<LotteryTicket[]>([]);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'admin' || user?.role === 'master_admin';

  // Nombres de meses en ambos idiomas
  const monthNames = language === 'val' ? [
    'Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny',
    'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'
  ] : [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    loadLotteryDates();
    if (user) {
      loadUserTickets();
    }
  }, [user]);

  const loadLotteryDates = async () => {
    try {
      const { data, error } = await supabase
        .from('lottery_dates')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setLotteryDates(data || []);
    } catch (error) {
      console.error('Error cargando sorteos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('lottery_tickets')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setUserTickets(data || []);
    } catch (error) {
      console.error('Error cargando papeletas:', error);
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'val' ? 'ca-ES' : 'es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getUserTicketsForLottery = (lotteryId: string) => {
    return userTickets.filter(ticket => ticket.lottery_id === lotteryId);
  };

  const getTotalPrizeForLottery = (lotteryId: string) => {
    const tickets = getUserTicketsForLottery(lotteryId);
    const lottery = lotteryDates.find(l => l.id === lotteryId);
    return tickets.length * (lottery?.prize_amount || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {isAdmin ? t('lottery_admin_title') : t('lottery_title')}
        </h1>
      </div>

      {/* Lista de Sorteos por Meses - Diseño Mejorado */}
      <div className="space-y-4">
        {groupLotteriesByMonth(lotteryDates).map(({ month, lotteries }) => (
          <div key={month} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            {/* Header del Mes - Traducido */}
            <div 
              onClick={() => toggleMonth(month)}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {expandedMonths.has(month) ? (
                    <ChevronDownIcon className="h-5 w-5 text-blue-600 mr-2" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5 text-blue-600 mr-2" />
                  )}
                  <h2 className="text-lg font-bold text-gray-800">
                    {month}
                  </h2>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600">
                    {lotteries.length} {lotteries.length === 1 ? 
                      (language === 'val' ? 'sorteig' : 'sorteo') : 
                      (language === 'val' ? 'sortejos' : 'sorteos')
                    }
                  </div>
                  {lotteries.some(l => l.prize_amount && l.prize_amount > 0) && (
                    <div className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                      {language === 'val' ? 'Premis:' : 'Premios:'} {lotteries.reduce((sum, l) => sum + (l.prize_amount || 0), 0).toFixed(2)}$
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sorteos del Mes - Solo si está expandido */}
            {expandedMonths.has(month) && (
              <div className="divide-y divide-gray-100">
                {lotteries.map((lottery) => {
                  const userTickets = getUserTicketsForLottery(lottery.id);
                  const totalPrize = getTotalPrizeForLottery(lottery.id);
                  const hasWon = totalPrize > 0;

                  return (
                    <div key={lottery.id} className="p-4 hover:bg-gray-50 transition-colors">
                      {/* Línea separadora visual para móvil */}
                      <div className="border-b border-gray-200 pb-4 mb-4 sm:border-0 sm:pb-0 sm:mb-0"></div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Información del Sorteo */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            {/* Icono de sorteo azul */}
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <GiftIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {lottery.name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <CalendarIcon className="h-4 w-4" />
                                {formatDate(lottery.date)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Estado de Premios */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          {hasWon && (
                            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                              <div className="text-sm font-semibold text-green-800">
                                {language === 'val' ? 'Premiat!' : '¡Premiado!'}
                              </div>
                              <div className="text-xs text-green-600">
                                {totalPrize.toFixed(2)}$
                              </div>
                            </div>
                          )}

                          {/* Papeletas del usuario */}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <TicketIcon className="h-4 w-4" />
                            <span>
                              {userTickets.length} {userTickets.length === 1 ? 
                                (language === 'val' ? 'papeleta' : 'papeleta') : 
                                (language === 'val' ? 'papeletes' : 'papeletas')
                              }
                            </span>
                          </div>

                          {/* Badge de premio del sorteo */}
                          {lottery.prize_amount && lottery.prize_amount > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                              <div className="text-xs font-semibold text-blue-800">
                                {language === 'val' ? 'Premi del sorteig:' : 'Premio del sorteo:'}
                              </div>
                              <div className="text-sm text-blue-600">
                                {lottery.prize_amount.toFixed(2)}$
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Detalles de papeletas si existen */}
                      {userTickets.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            {language === 'val' ? 'Les teves papeletes:' : 'Tus papeletas:'}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {userTickets.map((ticket) => (
                              <div key={ticket.id} className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
                                <div className="font-medium text-gray-900">
                                  {language === 'val' ? 'Núm. Loteria:' : 'Núm. Lotería:'} {ticket.lottery_number}
                                </div>
                                {ticket.primitive_number && (
                                  <div className="text-gray-600">
                                    {language === 'val' ? 'Núm. Primitiva:' : 'Núm. Primitiva:'} {ticket.primitive_number}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500">
                                  {ticket.is_paid ? 
                                    (language === 'val' ? 'Pagat' : 'Pagado') : 
                                    (language === 'val' ? 'Pendent' : 'Pendiente')
                                  }
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {lotteryDates.length === 0 && (
        <div className="text-center py-12">
          <GiftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {language === 'val' ? 'No hi ha sorteos disponibles' : 'No hay sorteos disponibles'}
          </h3>
          <p className="text-gray-500">
            {language === 'val' ? 
              'Els sorteos apareixeran aquí quan es creïn' : 
              'Los sorteos aparecerán aquí cuando se creen'
            }
          </p>
        </div>
      )}
    </div>
  );
}

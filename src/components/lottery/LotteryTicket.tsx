import React from 'react';
import { useTranslation } from '../../lib/i18n';
import { LotteryTicket as LotteryTicketType, LotteryPrize } from '../../lib/supabase';
import { Ticket, Gift, Trophy, Calendar } from 'lucide-react';

interface LotteryTicketProps {
  ticket: LotteryTicketType;
  prizes?: LotteryPrize[];
  showPrizes?: boolean;
}

export default function LotteryTicket({ ticket, prizes = [], showPrizes = false }: LotteryTicketProps) {
  const { t } = useTranslation();

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Obtener premios para esta papeleta
  const ticketPrizes = prizes.filter(prize => 
    (prize.prize_type === 'lottery' && prize.winning_number === ticket.lottery_number) ||
    (prize.prize_type === 'primitive' && 
     ticket.primitive_numbers.some(num => prize.winning_numbers?.includes(num)))
  );

  const totalPrizes = ticketPrizes.reduce((sum, prize) => sum + prize.prize_amount, 0);

  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-slate-200 overflow-hidden">
      {/* Header de la papeleta */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Ticket className="w-8 h-8" />
            <div>
              <h3 className="text-lg font-bold">{t('lotteryTicket')}</h3>
              <p className="text-blue-100 text-sm">{formatDate(ticket.created_at)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{ticket.total_amount.toFixed(2)}€</p>
            <p className="text-blue-100 text-xs">{t('totalAmount')}</p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6 space-y-6">
        {/* Sección Lotería Nacional */}
        <div className="border-l-4 border-red-500 pl-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-slate-800 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-red-500" />
              {t('nationalLottery')}
            </h4>
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
              {ticket.lottery_amount.toFixed(2)}€
            </span>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <p className="text-sm text-slate-600 mb-2">{t('lotteryNumber')}</p>
            <div className="text-4xl font-bold text-red-600 tracking-wider">
              {ticket.lottery_number}
            </div>
          </div>
        </div>

        {/* Sección Primitiva */}
        <div className="border-l-4 border-green-500 pl-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-slate-800 flex items-center">
              <Gift className="w-5 h-5 mr-2 text-green-500" />
              {t('primitiveLottery')}
            </h4>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              {ticket.primitive_amount.toFixed(2)}€
            </span>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-3 text-center">{t('selectedNumbers')}</p>
            <div className="grid grid-cols-4 gap-2">
              {ticket.primitive_numbers.map((num, index) => (
                <div
                  key={index}
                  className="bg-green-500 text-white rounded-lg w-12 h-12 flex items-center justify-center font-bold text-lg"
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sección Donativo */}
        <div className="border-l-4 border-purple-500 pl-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-800 flex items-center">
              <Gift className="w-5 h-5 mr-2 text-purple-500" />
              {t('donation')}
            </h4>
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
              {ticket.donation_amount.toFixed(2)}€
            </span>
          </div>
        </div>

        {/* Estado de pago */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">
              {ticket.is_paid ? t('paid') : t('pending')}
            </span>
          </div>
          {ticket.is_paid && ticket.paid_at && (
            <span className="text-xs text-slate-500">
              {formatDate(ticket.paid_at)}
            </span>
          )}
        </div>

        {/* Premios obtenidos */}
        {showPrizes && ticketPrizes.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
              {t('prizesWon')}
            </h4>
            <div className="space-y-2">
              {ticketPrizes.map((prize, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded border border-yellow-300">
                  <div>
                    <p className="font-medium text-slate-800">{prize.prize_category}</p>
                    <p className="text-sm text-slate-600">{prize.description}</p>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    +{prize.prize_amount.toFixed(2)}€
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-yellow-300 mt-2">
                <span className="font-semibold text-yellow-800">{t('totalPrizes')}</span>
                <span className="text-xl font-bold text-green-600">
                  {totalPrizes.toFixed(2)}€
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

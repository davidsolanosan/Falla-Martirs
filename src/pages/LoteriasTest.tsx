import React, { useEffect } from 'react';
import { useTranslation } from '../lib/i18n';
import { useSupabase } from '../lib/SupabaseContext';

export default function LoteriasTest() {
  const { t } = useTranslation();
  const { lotteryDates, lotteryTickets, lotteryPrizes, loading, error } = useSupabase();

  useEffect(() => {
    console.log('🎫 Lottery Dates:', lotteryDates);
    console.log('🎫 Lottery Tickets:', lotteryTickets);
    console.log('🏆 Lottery Prizes:', lotteryPrizes);
    console.log('📊 Loading:', loading);
    console.log('❌ Error:', error);
  }, [lotteryDates, lotteryTickets, lotteryPrizes, loading, error]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">{t('loading')}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-red-800 mb-2">Error de Conexión</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="text-sm text-red-500 space-y-2">
            <p>• Verifica las credenciales de Supabase</p>
            <p>• Revisa las políticas RLS</p>
            <p>• Verifica la configuración de la base de datos</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">
            🎫 {t('lotteryTitle')} - Test de Datos
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fechas de Lotería */}
            <div className="bg-slate-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                📅 {t('lotteryDates')} ({lotteryDates.length})
              </h2>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {lotteryDates.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No hay fechas de lotería</p>
                ) : (
                  lotteryDates.map((date) => (
                    <div key={date.id} className="bg-white p-3 rounded border border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{date.name}</span>
                        <span className="text-sm text-slate-500">{date.date}</span>
                        {date.special && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                            {t('special')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Papeletas */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                🎫 Papeletas ({lotteryTickets.length})
              </h2>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {lotteryTickets.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No hay papeletas</p>
                ) : (
                  lotteryTickets.map((ticket) => (
                    <div key={ticket.id} className="bg-white p-3 rounded border border-blue-200">
                      <div className="text-sm">
                        <div className="font-medium">Lotería: {ticket.lottery_number}</div>
                        <div className="text-slate-600">Usuario: {ticket.user_id}</div>
                        <div className="text-slate-600">Familia: {ticket.family_id}</div>
                        <div className="font-semibold text-green-600">Total: {ticket.total_amount}€</div>
                        <div className={ticket.is_paid ? 'text-green-600' : 'text-red-600'}>
                          {ticket.is_paid ? 'Pagado' : 'Pendiente'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Premios */}
            <div className="bg-yellow-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                🏆 Premios ({lotteryPrizes.length})
              </h2>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {lotteryPrizes.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No hay premios</p>
                ) : (
                  lotteryPrizes.map((prize) => (
                    <div key={prize.id} className="bg-white p-3 rounded border border-yellow-200">
                      <div className="text-sm">
                        <div className="font-medium">{prize.prize_category}</div>
                        <div className="text-slate-600">Tipo: {prize.prize_type}</div>
                        <div className="font-semibold text-green-600">Importe: {prize.prize_amount}€</div>
                        {prize.winning_number && (
                          <div className="text-slate-600">Número: {prize.winning_number}</div>
                        )}
                        {prize.description && (
                          <div className="text-slate-600">{prize.description}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              ✅ Si ves estos datos, la conexión con Supabase funciona correctamente.
            </p>
            <p className="text-sm text-slate-600">
              🎫 Ahora puedes crear papeletas y gestionar premios desde la administración.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

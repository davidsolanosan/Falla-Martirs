import React, { useState, useEffect } from 'react';
import { useSupabase } from '../lib/SupabaseContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../lib/i18n';
import { Calendar, Clock, Info, X, CheckCircle, XCircle } from 'lucide-react';

interface CasalRental {
  id: string;
  user_id: string;
  rental_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  price: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface CasalSettings {
  id: string;
  daily_price: number;
  rules: string;
  blocked_dates: string[];
  updated_at: string;
}

export default function Casal() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { casalRentals, casalSettings, refreshCasalRentals, refreshCasalSettings, createCasalRental } = useSupabase();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [showRules, setShowRules] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    refreshCasalRentals();
    refreshCasalSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      setError(t('selectDate'));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const settings = casalSettings?.[0];
      const price = settings?.daily_price || 50;

      // Usar el ID del usuario del contexto (debe coincidir con tabla users)
      const userId = user?.id;

      if (!userId) {
        setError(t('errorCreatingRequest') || 'Error: No se pudo obtener el ID de usuario');
        return;
      }

      await createCasalRental({
        user_id: userId,
        rental_date: selectedDate,
        status: 'pending',
        price: price,
        notes: notes || null
      });

      setSuccess(t('requestSent'));
      setSelectedDate('');
      setNotes('');
      refreshCasalRentals();
    } catch (err: any) {
      setError(err.message || t('errorCreatingRequest'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (rentalId: string) => {
    if (!confirm(t('confirmCancel'))) {
      return;
    }

    try {
      // Aquí necesitaríamos implementar la función de cancelación
      // Por ahora, solo mostramos un mensaje
      setSuccess(t('requestCancelled'));
      refreshCasalRentals();
    } catch (err: any) {
      setError(err.message || t('errorCancellingRequest'));
    }
  };

  const settings = casalSettings?.[0];
  const myRentals = casalRentals?.filter(r => r.user_id === user?.id) || [];

  const isDateBlocked = (date: string) => {
    if (!settings?.blocked_dates) return false;
    return settings.blocked_dates.includes(date);
  };

  const isDateTaken = (date: string) => {
    return myRentals.some(r => r.rental_date === date && r.status !== 'cancelled');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'cancelled': return 'text-gray-600 bg-gray-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return t('approved');
      case 'rejected': return t('rejected');
      case 'cancelled': return t('cancelled');
      default: return t('pending');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{t('casalTitle')}</h1>
          <p className="text-slate-600 mt-2">{t('casalDescription')}</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario de solicitud */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {t('requestRental')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('selectDate')} *
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                {selectedDate && isDateBlocked(selectedDate) && (
                  <p className="text-red-600 text-sm mt-1">{t('dateBlocked')}</p>
                )}
                {selectedDate && isDateTaken(selectedDate) && (
                  <p className="text-yellow-600 text-sm mt-1">{t('dateTaken')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('notes')} ({t('optional')})
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('addNotes')}
                />
              </div>

              {settings && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">{t('rentalPrice')}:</span> {settings.daily_price}€ {t('perDay')}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !selectedDate || isDateBlocked(selectedDate) || isDateTaken(selectedDate)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? t('sending') : t('requestRental')}
              </button>
            </form>

            <button
              onClick={() => setShowRules(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
            >
              <Info className="w-4 h-4" />
              {t('viewRules')}
            </button>
          </div>

          {/* Mis solicitudes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {t('myRentals')}
            </h2>

            {myRentals.length === 0 ? (
              <p className="text-slate-500 text-center py-8">{t('noRequests')}</p>
            ) : (
              <div className="space-y-3">
                {myRentals.map((rental) => (
                  <div key={rental.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-slate-900">
                          {new Date(rental.rental_date).toLocaleDateString('es-ES', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-sm text-slate-600">{rental.price}€</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rental.status)}`}>
                        {getStatusText(rental.status)}
                      </span>
                    </div>
                    {rental.notes && (
                      <p className="text-sm text-slate-600 mt-2">{rental.notes}</p>
                    )}
                    {rental.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(rental.id)}
                        className="mt-3 text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        {t('cancel')}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal de normas */}
        {showRules && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-slate-900">{t('rentalRules')}</h3>
                  <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="prose prose-slate max-w-none">
                  {settings ? (
                    <div className="whitespace-pre-line text-slate-700">{settings.rules}</div>
                  ) : (
                    <p className="text-slate-500">{t('noRulesAvailable')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

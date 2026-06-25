import React, { useState, useEffect } from 'react';
import { useSupabase } from '../../lib/SupabaseContext';
import { useTranslation } from '../../lib/i18n';
import { Calendar, Clock, Settings, CheckCircle, XCircle, ChevronLeft, ChevronRight, X, Save, RotateCcw } from 'lucide-react';

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

export default function CasalAdmin() {
  const { t } = useTranslation();
  const { casalRentals, casalSettings, refreshCasalRentals, refreshCasalSettings, updateCasalRental, updateCasalSettings, users } = useSupabase();
  const [activeTab, setActiveTab] = useState<'calendar' | 'requests' | 'settings'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [settingsForm, setSettingsForm] = useState({
    daily_price: 50,
    rules: '',
    blocked_dates: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    refreshCasalRentals();
    refreshCasalSettings();
  }, []);

  useEffect(() => {
    if (casalSettings?.[0]) {
      const settings = casalSettings[0];
      setSettingsForm({
        daily_price: settings.daily_price,
        rules: settings.rules,
        blocked_dates: settings.blocked_dates || []
      });
    }
  }, [casalSettings]);

  const handleApprove = async (rentalId: string) => {
    try {
      await updateCasalRental(rentalId, { status: 'approved' });
      setSuccess(t('rentalStatusUpdated'));
      refreshCasalRentals();
    } catch (err: any) {
      setError(err.message || t('errorUpdatingRental'));
    }
  };

  const handleReject = async (rentalId: string) => {
    try {
      await updateCasalRental(rentalId, { status: 'rejected' });
      setSuccess(t('rentalStatusUpdated'));
      refreshCasalRentals();
    } catch (err: any) {
      setError(err.message || t('errorUpdatingRental'));
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const settings = casalSettings?.[0];
      if (settings) {
        await updateCasalSettings(settings.id, settingsForm);
        setSuccess(t('settingsUpdated'));
        refreshCasalSettings();
      }
    } catch (err: any) {
      setError(err.message || t('errorUpdatingSettings'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    const settings = casalSettings?.[0];
    if (settings) {
      setSettingsForm({
        daily_price: settings.daily_price,
        rules: settings.rules,
        blocked_dates: settings.blocked_dates || []
      });
    }
  };

  const toggleBlockedDate = (date: string) => {
    setSettingsForm(prev => ({
      ...prev,
      blocked_dates: prev.blocked_dates.includes(date)
        ? prev.blocked_dates.filter(d => d !== date)
        : [...prev.blocked_dates, date]
    }));
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    // Ajustar para que la semana empiece en lunes (0 = domingo, 1 = lunes, etc.)
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const formatDate = (date: Date) => {
    // Usar formato local para evitar problemas de zona horaria
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateBlocked = (date: Date) => {
    const dateStr = formatDate(date);
    return settingsForm.blocked_dates.includes(dateStr);
  };

  const isDateTaken = (date: Date) => {
    const dateStr = formatDate(date);
    return casalRentals?.some(r => r.rental_date === dateStr && r.status === 'approved');
  };

  const hasPendingRequest = (date: Date) => {
    const dateStr = formatDate(date);
    return casalRentals?.some(r => r.rental_date === dateStr && r.status === 'pending');
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getUserName = (userId: string) => {
    const user = users?.find(u => u.id === userId);
    return user ? `${user.name} ${user.surname}` : t('unknownUser');
  };

  const pendingRentals = casalRentals?.filter(r => r.status === 'pending') || [];
  const approvedRentals = casalRentals?.filter(r => r.status === 'approved') || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{t('casalAdmin')}</h1>
          <p className="text-slate-600 mt-2">{t('casalAdminDescription')}</p>
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

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 font-medium ${activeTab === 'calendar' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            {t('calendarManagement')}
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 font-medium ${activeTab === 'requests' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            {t('rentalRequests')}
            {pendingRentals.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {pendingRentals.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 font-medium ${activeTab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            {t('casalSettings')}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'calendar' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold text-slate-900">
                {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                <div key={day} className="text-center font-medium text-slate-600 text-sm">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonth(currentMonth).map((date, index) => {
                if (!date) return <div key={index} className="h-24" />;
                
                const dateStr = formatDate(date);
                const blocked = isDateBlocked(date);
                const taken = isDateTaken(date);
                const pending = hasPendingRequest(date);
                const isToday = dateStr === formatDate(new Date());

                return (
                  <div
                    key={dateStr}
                    onClick={() => toggleBlockedDate(dateStr)}
                    className={`h-24 p-2 rounded-lg border cursor-pointer transition-colors ${
                      blocked ? 'bg-red-100 border-red-300' :
                      taken ? 'bg-green-100 border-green-300' :
                      pending ? 'bg-yellow-100 border-yellow-300' :
                      isToday ? 'bg-blue-50 border-blue-300' :
                      'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-sm font-medium text-slate-900">{date.getDate()}</div>
                    <div className="mt-1 space-y-1">
                      {blocked && (
                        <div className="text-xs text-red-600">{t('blocked')}</div>
                      )}
                      {taken && (
                        <div className="text-xs text-green-600">{t('rented')}</div>
                      )}
                      {pending && (
                        <div className="text-xs text-yellow-600">{t('pending')}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex space-x-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <span className="text-slate-600">{t('blocked')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span className="text-slate-600">{t('rented')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                <span className="text-slate-600">{t('pending')}</span>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600">{t('blockedDatesHelp')}</p>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">{t('rentalRequests')}</h2>

            {pendingRentals.length === 0 && approvedRentals.length === 0 ? (
              <p className="text-slate-500 text-center py-8">{t('noRentals')}</p>
            ) : (
              <div className="space-y-4">
                {/* Solicitudes pendientes */}
                {pendingRentals.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 mb-3">{t('pendingRequests')}</h3>
                    {pendingRentals.map((rental) => (
                      <div key={rental.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 mb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-slate-900">
                              {new Date(rental.rental_date).toLocaleDateString('es-ES', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                            <p className="text-sm text-slate-600">{t('user')}: {getUserName(rental.user_id)}</p>
                            <p className="text-sm text-slate-600">{t('price')}: {rental.price}€</p>
                            {rental.notes && (
                              <p className="text-sm text-slate-600 mt-1">{t('notes')}: {rental.notes}</p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove(rental.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              {t('approve')}
                            </button>
                            <button
                              onClick={() => handleReject(rental.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1"
                            >
                              <XCircle className="w-4 h-4" />
                              {t('reject')}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Solicitudes aprobadas */}
                {approvedRentals.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 mb-3">{t('approvedRentals')}</h3>
                    {approvedRentals.map((rental) => (
                      <div key={rental.id} className="border border-green-200 bg-green-50 rounded-lg p-4 mb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-slate-900">
                              {new Date(rental.rental_date).toLocaleDateString('es-ES', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                            <p className="text-sm text-slate-600">{t('user')}: {getUserName(rental.user_id)}</p>
                            <p className="text-sm text-slate-600">{t('price')}: {rental.price}€</p>
                            {rental.notes && (
                              <p className="text-sm text-slate-600 mt-1">{t('notes')}: {rental.notes}</p>
                            )}
                          </div>
                          <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs">
                            {t('approved')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">{t('casalSettings')}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('dailyPrice')} (€)
                </label>
                <input
                  type="number"
                  value={settingsForm.daily_price}
                  onChange={(e) => setSettingsForm({ ...settingsForm, daily_price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('rentalRules')}
                </label>
                <textarea
                  value={settingsForm.rules}
                  onChange={(e) => setSettingsForm({ ...settingsForm, rules: e.target.value })}
                  rows={10}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('enterRules')}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? t('saving') : t('save')}
                </button>
                <button
                  onClick={handleResetSettings}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t('reset')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

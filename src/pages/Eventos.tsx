import React, { useState } from 'react';
import { useSupabase } from '../lib/SupabaseContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../lib/i18n';
import { CalendarDays, Plus, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es, ca } from 'date-fns/locale';
import { EventFormModal } from '../components/forms/EventFormModal';

export default function Eventos() {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const isAdmin = user?.role === 'admin' || user?.role === 'master_admin';
  
  const dateLocale = language === 'va' ? ca : es;
  const { events, loading } = useSupabase();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{t('navEvents')}</h2>
        {isAdmin && (
          <button 
            onClick={() => setIsEventModalOpen(true)}
            className="flex items-center justify-center bg-white text-[rgb(48,80,105)] border-3 border-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)] hover:text-white px-3 py-1.5 rounded-xl font-medium transition-all shadow-sm text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('createEvent')}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-r-2 border-t-2 border-[rgb(48,80,105)]"></div>
            <p className="mt-2 text-gray-600">{t('loading')}</p>
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <CalendarDays className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t('noEventsAvailable')}
          </h3>
          <p className="text-gray-600">
            {t('noEventsDescription')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map(event => {
          const date = new Date(event.event_date);
          return (
            <div key={event.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-indigo-50 text-indigo-700 p-3 rounded-2xl text-center min-w-[70px]">
                    <p className="text-xs font-bold uppercase">{format(date, 'MMM', { locale: dateLocale })}</p>
                    <p className="text-2xl font-bold">{format(date, 'dd')}</p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800">
                    {event.includes_meal ? 'Con comida' : 'Sin comida'}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-2">{event.title}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{event.description}</p>
                
                {event.image_url && (
                  <div className="mb-4">
                    <img 
                      src={event.image_url} 
                      alt={event.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-slate-600">
                    <Clock className="w-4 h-4 mr-2 text-slate-400" />
                    {format(date, 'HH:mm')} h
                  </div>
                  {event.registration_deadline && (
                    <div className="flex items-center text-sm text-slate-600">
                      <CalendarDays className="w-4 h-4 mr-2 text-slate-400" />
                      {t('deadline')}: {new Date(event.registration_deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      event.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.is_active ? t('active') : t('inactive')}
                    </span>
                  </div>
                  {isAdmin ? (
                    <button className="text-sm font-medium text-[rgb(48,80,105)] bg-white border-3 border-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)] hover:text-white px-4 py-2 rounded-xl transition-all">
                      {t('manageEvent')}
                    </button>
                  ) : user?.isFamilyAdmin ? (
                    <button className="text-sm font-medium text-white bg-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)] hover:bg-white hover:text-[rgb(48,80,105)] px-4 py-2 rounded-xl transition-all">
                      {t('join')}
                    </button>
                  ) : (
                    <div className="relative group">
                      <button disabled className="text-sm font-medium text-[rgb(48,80,105)] bg-white border-3 border-[rgb(48,80,105)] px-4 py-2 rounded-xl cursor-not-allowed opacity-75">
                        {t('join')}
                      </button>
                      <div className="absolute bottom-full mb-2 right-0 w-48 p-2 bg-[rgb(48,80,105)] text-white text-xs rounded-xl text-center z-10 shadow-lg hidden group-hover:block">
                        {t('onlyFamilyAdmins')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
      <EventFormModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} />
    </div>
  );
}

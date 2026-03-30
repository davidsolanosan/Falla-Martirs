import React, { useState } from 'react';
import { useData } from '../lib/DataContext';
import { useTranslation } from '../lib/i18n';
import { CalendarDays, Plus, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es, ca } from 'date-fns/locale';
import { EventFormModal } from '../components/forms/EventFormModal';

export default function Eventos() {
  const { events, currentUser } = useData();
  const { t, language } = useTranslation();
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'directiva';
  
  const dateLocale = language === 'va' ? ca : es;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{t('navEvents')}</h2>
        {isAdmin && (
          <button 
            onClick={() => setIsEventModalOpen(true)}
            className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('createEvent')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map(event => {
          const date = new Date(event.date);
          return (
            <div key={event.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-indigo-50 text-indigo-700 p-3 rounded-2xl text-center min-w-[70px]">
                    <p className="text-xs font-bold uppercase">{format(date, 'MMM', { locale: dateLocale })}</p>
                    <p className="text-2xl font-bold">{format(date, 'dd')}</p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800">
                    €{event.price}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-2">{event.title}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{event.description}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-slate-600">
                    <Clock className="w-4 h-4 mr-2 text-slate-400" />
                    {format(date, 'HH:mm')} h
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                    Casal Fallero
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex -space-x-2">
                    {/* Mock avatars */}
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500">
                        {i}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500">
                      +{event.attendees.length}
                    </div>
                  </div>
                  {isAdmin ? (
                    <button className="text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors">
                      {t('manageEvent')}
                    </button>
                  ) : currentUser.isFamilyAdmin ? (
                    <button className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-colors">
                      {t('join')}
                    </button>
                  ) : (
                    <div className="group relative flex items-center">
                      <button disabled className="text-sm font-medium text-slate-400 bg-slate-100 px-4 py-2 rounded-xl cursor-not-allowed">
                        {t('join')}
                      </button>
                      <div className="absolute bottom-full mb-2 right-0 w-48 p-2 bg-slate-800 text-white text-xs rounded-lg text-center z-10 shadow-lg hidden group-hover:block">
                        {t('onlyFamilyAdmins')}
                        <div className="absolute top-full right-4 border-4 border-transparent border-t-slate-800"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <EventFormModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} />
    </div>
  );
}

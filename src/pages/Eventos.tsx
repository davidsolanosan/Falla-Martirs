import React, { useState } from 'react';
import { useSupabase } from '../lib/SupabaseContext';
import { useTranslation } from '../lib/i18n';
import { CalendarDays, Plus, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es, ca } from 'date-fns/locale';
import { EventFormModal } from '../components/forms/EventFormModal';

export default function Eventos() {
  const { user } = useSupabase();
  const { t, language } = useTranslation();
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const isAdmin = user.role === 'admin' || user.role === 'master_admin';
  
  const dateLocale = language === 'va' ? ca : es;
  
  // Datos de ejemplo para eventos (mientras implementamos la tabla events)
  const events = [
    {
      id: '1',
      title: 'Cena de Fallas',
      description: 'Cena tradicional para celebrar las fallas',
      date: '2024-03-15T20:00:00',
      price: 25,
      location: 'Restaurante El Rincón',
      attendees: ['user1', 'user2', 'user3', 'user4']
    },
    {
      id: '2', 
      title: 'Desfile Infantil',
      description: 'Desfile de los más pequeños de la falla',
      date: '2024-03-20T10:00:00',
      price: 0,
      location: 'Plaza Mayor',
      attendees: ['user5', 'user6']
    }
  ];

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
                    <button className="text-sm font-medium text-[rgb(48,80,105)] bg-white border-3 border-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)] hover:text-white px-4 py-2 rounded-xl transition-all">
                      {t('manageEvent')}
                    </button>
                  ) : user.isFamilyAdmin ? (
                    <button className="text-sm font-medium text-white bg-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)] hover:bg-white hover:text-[rgb(48,80,105)] px-4 py-2 rounded-xl transition-all">
                      {t('join')}
                    </button>
                  ) : (
                    <div className="group relative flex items-center">
                      <button disabled className="text-sm font-medium text-[rgb(48,80,105)] bg-white border-3 border-[rgb(48,80,105)] px-4 py-2 rounded-xl cursor-not-allowed opacity-75">
                        {t('join')}
                      </button>
                      <div className="absolute bottom-full mb-2 right-0 w-48 p-2 bg-[rgb(48,80,105)] text-white text-xs rounded-xl text-center z-10 shadow-lg hidden group-hover:block">
                        {t('onlyFamilyAdmins')}
                        <div className="absolute top-full right-4 border-4 border-transparent border-t-[rgb(48,80,105)]"></div>
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

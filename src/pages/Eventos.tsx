import React, { useState } from 'react';
import { useSupabase } from '../lib/SupabaseContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../lib/i18n';
import { CalendarDays, MapPin, Clock, X, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es, ca } from 'date-fns/locale';

export default function Eventos() {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const { events, loading, users, families, eventPrices, createEventRegistration, eventRegistrations, deleteEventRegistration } = useSupabase();
  
  const dateLocale = language === 'va' ? ca : es;

  // Función para verificar si el plazo de inscripción ha finalizado
  const isRegistrationDeadlinePassed = (event) => {
    if (!event.registration_deadline) return false;
    
    const deadline = new Date(event.registration_deadline);
    const now = new Date();
    // Establecer hora a 00:00:00 para comparar solo fechas
    deadline.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    return now > deadline;
  };

  // Función para abrir modal de inscripción
  const openRegistrationModal = (event) => {
    // Verificar si el plazo ha finalizado
    if (isRegistrationDeadlinePassed(event)) {
      console.log('❌ Plazo de inscripción finalizado para evento:', event.title);
      return;
    }
    
    console.log('🔍 Abriendo modal de inscripción para evento:', event);
    setSelectedEvent(event);
    setIsRegistrationModalOpen(true);
  };

  // Función para eliminar inscripción
  const handleUnregister = async (memberId) => {
    if (!selectedEvent) return;
    
    // Verificar si el plazo ha finalizado
    if (isRegistrationDeadlinePassed(selectedEvent)) {
      console.log('❌ No se puede eliminar inscripción - plazo finalizado');
      return;
    }
    
    try {
      const registration = eventRegistrations.find(
        r => r.event_id === selectedEvent.id && r.user_id === memberId
      );
      
      if (registration) {
        await deleteEventRegistration(registration.id);
        console.log('✅ Inscripción eliminada para:', memberId);
      }
    } catch (error) {
      console.error('❌ Error al eliminar inscripción:', error);
    }
  };

  // Función para inscribir miembros
  const handleRegister = async (memberIds, includesMeal, event) => {
    if (!event) return;
    
    // Verificar si el plazo ha finalizado
    if (isRegistrationDeadlinePassed(event)) {
      console.log('❌ No se puede inscribir - plazo finalizado');
      return;
    }
    
    console.log('🔍 Iniciando inscripción:', { memberIds, includesMeal, event });
    
    try {
      // Obtener familia y miembros - usar el usuario completo de SupabaseContext
      const fullUser = users.find(u => u.id === user?.id);
      const userFamily = families.find(f => f.id === fullUser?.family_id);
      
      console.log('🔍 Usuario completo:', fullUser);
      console.log('🔍 Familia:', userFamily);
      
      for (const memberId of memberIds) {
        // Obtener categoría del miembro
        const member = users.find(u => u.id === memberId);
        const categoryId = member?.category_id;
        
        console.log('🔍 Procesando miembro:', { memberId, categoryId });
        
        if (!categoryId) {
          console.error('❌ El miembro no tiene categoría asignada:', memberId);
          alert('El miembro no tiene categoría asignada. Por favor, contacta con el administrador.');
          continue;
        }
        
        // Verificar si hay precios configurados para el evento
        const eventPricesForEvent = eventPrices.filter(p => p.event_id === event.id);
        console.log('🔍 Precios del evento:', eventPricesForEvent);
        
        if (eventPricesForEvent.length === 0) {
          console.error('❌ No hay precios configurados para este evento');
          alert('No hay precios configurados para este evento. Por favor, contacta con el administrador.');
          continue;
        }
        
        // Buscar precio para la categoría específica
        let eventPrice = eventPricesForEvent.find(p => p.category_id === categoryId);
        
        if (!eventPrice) {
          console.warn('⚠️ No hay precio para la categoría específica, usando primera disponible');
          // Usar la primera categoría disponible como por defecto
          const defaultCategory = eventPrices[0]?.category_id;
          if (!defaultCategory) {
            console.error('❌ No hay categorías disponibles para este evento');
            alert('No hay categorías configuradas para este evento. Por favor, configura los precios primero.');
            continue;
          }
          
          categoryId = defaultCategory;
          console.log('🔧 Usando categoría por defecto:', categoryId);
        }
        
        // Calcular el precio según la categoría
        const finalEventPrice = eventPrices.find(p => 
          p.event_id === event.id && p.category_id === categoryId
        );
        
        const calculatedPrice = finalEventPrice?.price || 0;
        
        console.log('💰 Precio calculado:', {
          event_id: event.id,
          category_id: categoryId,
          eventPrice: finalEventPrice,
          calculatedPrice
        });
        
        await createEventRegistration({
          event_id: event.id,
          user_id: memberId,
          family_id: userFamily?.id || '',
          category_id: categoryId,
          includes_meal: includesMeal,
          total_price: calculatedPrice,
          registered_by: user?.id || '',
          registered_at: new Date().toISOString()
        });
      }

      setIsRegistrationModalOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error al inscribir:', error);
    }
  };

  // Componente modal de inscripción
  const EventRegistrationModal = ({ event, onClose, onRegister, isRegistrationDeadlinePassed }) => {
    console.log('🔍 EventRegistrationModal renderizado con evento:', event);
    console.log('🔍 Datos de comida del evento:', {
      includes_meal: event.includes_meal,
      meal_type: event.meal_type,
      meal_cost: event.meal_cost
    });
    
    // Obtener familia y miembros - usar el usuario completo de SupabaseContext
    const fullUser = users.find(u => u.id === user?.id);
    const userFamily = families.find(f => f.id === fullUser?.family_id);
    const familyMembers = users.filter(u => u.family_id === userFamily?.id);
    
    // Inicializar con miembros ya inscritos
    const initiallyRegisteredMembers = familyMembers
      .filter(member => eventRegistrations.some(r => r.event_id === event.id && r.user_id === member.id))
      .map(member => member.id);
    
    const [selectedMembers, setSelectedMembers] = useState(initiallyRegisteredMembers);
    const [memberMeals, setMemberMeals] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Verificar si el plazo ha finalizado
    const deadlinePassed = isRegistrationDeadlinePassed(event);

    // Verificar si un miembro ya está inscrito
    const isMemberRegistered = (memberId) => {
      return eventRegistrations.some(r => r.event_id === event.id && r.user_id === memberId);
    };

    console.log('🔍 Datos del usuario (Auth):', user);
    console.log('🔍 Datos del usuario (Completo):', fullUser);
    console.log('🔍 Familia encontrada:', userFamily);
    console.log('🔍 Miembros de la familia:', familyMembers);
    console.log('🔍 Precios del evento:', eventPrices);

    // Calcular coste total (correcto: precios por categoría + coste adicional)
    const calculateTotal = () => {
      let total = 0;
      
      console.log('🔍 Calculando total correcto:', {
        selectedMembers,
        memberMeals,
        eventPrices,
        eventMealCost: event.meal_cost
      });
      
      // Sumar precios por categoría para cada miembro seleccionado
      for (const memberId of selectedMembers) {
        // Obtener categoría del miembro
        const member = users.find(u => u.id === memberId);
        const categoryId = member?.category_id;
        
        if (categoryId) {
          // Buscar precio para esta categoría en este evento
          const eventPrice = eventPrices.find(p => 
            p.event_id === event.id && p.category_id === categoryId
          );
          
          const categoryPrice = eventPrice?.price || 0;
          total += categoryPrice;
          
          console.log(`💰 Miembro ${memberId}:`, {
            categoryId,
            categoryPrice,
            memberName: `${member?.name} ${member?.surname}`
          });
        }
      }
      
      // Añadir coste adicional por comida si aplica
      if (event.includes_meal && event.meal_cost) {
        const membersWithMeal = selectedMembers.filter(id => memberMeals[id]).length;
        const mealAdditionalCost = event.meal_cost * membersWithMeal;
        total += mealAdditionalCost;
        
        console.log('🍽️ Coste adicional comida:', {
          mealCostPerPerson: event.meal_cost,
          membersWithMeal,
          mealAdditionalCost
        });
      }
      
      console.log('🎯 TOTAL FINAL:', total);
      return total;
    };

    const handleMemberToggle = (memberId) => {
      if (selectedMembers.includes(memberId)) {
        // Si se deselecciona, eliminar también la opción de comida
        setSelectedMembers(selectedMembers.filter(id => id !== memberId));
        setMemberMeals(prev => {
          const newMeals = { ...prev };
          delete newMeals[memberId];
          return newMeals;
        });
      } else {
        // Si se selecciona, añadir con opción de comida por defecto
        setSelectedMembers([...selectedMembers, memberId]);
        setMemberMeals(prev => ({
          ...prev,
          [memberId]: event.includes_meal // Por defecto marcado si el evento incluye comida
        }));
      }
    };

    const handleMealToggle = (memberId) => {
      setMemberMeals(prev => ({
        ...prev,
        [memberId]: !prev[memberId]
      }));
    };

    const handleSubmit = async () => {
      setIsSubmitting(true);
      
      try {
        // 1. Procesar nuevos miembros y modificaciones
        for (const memberId of selectedMembers) {
          const isRegistered = eventRegistrations.some(r => r.event_id === event.id && r.user_id === memberId);
          
          if (!isRegistered) {
            // Nuevo miembro - inscribir
            await onRegister([memberId], memberMeals[memberId] || false);
          } else {
            // Miembro existente - podría necesitar actualizar opciones de comida
            // Por ahora, mantenemos la inscripción existente
            console.log('Miembro ya inscrito, manteniendo registro:', memberId);
          }
        }
        
        // 2. Identificar miembros que fueron deseleccionados (para desinscribir)
        const registeredMembers = familyMembers.filter(member => 
          eventRegistrations.some(r => r.event_id === event.id && r.user_id === member.id)
        );
        
        const membersToUnregister = registeredMembers.filter(member => 
          !selectedMembers.includes(member.id)
        );
        
        // 3. Desinscribir miembros que fueron deseleccionados
        for (const member of membersToUnregister) {
          await handleUnregister(member.id);
        }
        
        setIsSubmitting(false);
        onClose(); // Cerrar modal después de guardar
        
      } catch (error) {
        console.error('Error al guardar inscripciones:', error);
        setIsSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-800">{t('registerForEvent')}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {deadlinePassed && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center text-red-700">
                <X className="w-5 h-5 mr-2" />
                <span className="font-medium">{t('registrationDeadlinePassed')}</span>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h4 className="font-semibold text-slate-700 mb-3">{t('selectFamilyMembers')}</h4>
            {!userFamily ? (
              <div className="text-center py-8 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="text-amber-600 mb-2">
                  <Users className="w-12 h-12 mx-auto mb-2" />
                </div>
                <h3 className="text-lg font-semibold text-amber-800 mb-2">
                  {t('noFamilyAssigned')}
                </h3>
                <p className="text-amber-700">
                  {t('noFamilyDescription')}
                </p>
              </div>
            ) : familyMembers.length === 0 ? (
              <div className="text-center py-8 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="text-blue-600 mb-2">
                  <Users className="w-12 h-12 mx-auto mb-2" />
                </div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  {t('noFamilyMembers')}
                </h3>
                <p className="text-blue-700">
                  {t('noFamilyMembersDescription')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {familyMembers.map(member => {
                  const isRegistered = isMemberRegistered(member.id);
                  const isSelected = selectedMembers.includes(member.id);
                  const categoryPrice = eventPrices.find(p => p.event_id === event.id && p.category_id === member.category_id);
                  
                  return (
                    <div key={member.id} className={`border rounded-xl p-4 transition-colors ${
                      isRegistered ? 'bg-green-50 border-green-200' : 'hover:bg-slate-50'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          {!isRegistered ? (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleMemberToggle(member.id)}
                              disabled={deadlinePassed}
                              className={`mr-3 h-5 w-5 rounded focus:ring-[rgb(48,80,105)] ${
                                deadlinePassed
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-[rgb(48,80,105)]'
                              }`}
                            />
                          ) : (
                            <div className="mr-3 h-5 w-5 bg-green-500 rounded flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-lg">{member.name} {member.surname}</p>
                            <p className="text-sm text-slate-500">
                              {isRegistered ? '✅ ' : ''}{categoryPrice?.price || 0}€
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {isRegistered ? (
                            <button
                              onClick={() => handleUnregister(member.id)}
                              disabled={deadlinePassed}
                              className={`px-3 py-1 text-white text-sm rounded transition-colors ${
                                deadlinePassed
                                  ? 'bg-gray-300 cursor-not-allowed opacity-50'
                                  : 'bg-red-500 hover:bg-red-600'
                              }`}
                            >
                              {t('unregister')}
                            </button>
                          ) : isSelected && (
                            <p className="text-sm font-medium text-slate-600">
                              {categoryPrice?.price || 0}€
                            </p>
                          )}
                        </div>
                      </div>
                  
                  {selectedMembers.includes(member.id) && event.includes_meal && (
                    <div className="ml-8 p-3 bg-slate-50 rounded-lg">
                      <label className="flex items-center cursor-pointer mb-2">
                        <input
                          type="checkbox"
                          checked={memberMeals[member.id] || false}
                          onChange={() => handleMealToggle(member.id)}
                          className="mr-3 h-4 w-4 text-[rgb(48,80,105)] rounded focus:ring-[rgb(48,80,105)]"
                        />
                        <div>
                          <p className="font-medium text-sm">{t('includeMeal')}</p>
                          <p className="text-xs text-slate-500">{t('mealDescription')}</p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Información del evento configurada desde administración */}
          {event.includes_meal && (
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">Información del Menú</h4>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-slate-600">Menú:</span>
                    <span className="text-sm text-slate-800 ml-2">
                      {event.meal_type || 'No especificado'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-slate-600">Coste por persona:</span>
                    <span className="text-sm text-slate-800 ml-2">
                      {event.meal_cost !== undefined && event.meal_cost !== null 
                        ? `€${event.meal_cost}` 
                        : 'Gratuito'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-lg font-semibold">{t('total')}:</span>
                <p className="text-sm text-slate-500">
                  {selectedMembers.length} {selectedMembers.length === 1 ? 'persona' : 'personas'}
                  {event.includes_meal && selectedMembers.some(id => memberMeals[id]) && 
                    ` • ${selectedMembers.filter(id => memberMeals[id]).length} con comida`
                  }
                </p>
              </div>
              <span className="text-2xl font-bold text-[rgb(48,80,105)]">€{calculateTotal()}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border-3 border-[rgb(48,80,105)] text-[rgb(48,80,105)] rounded-xl font-medium hover:bg-slate-50 transition-all"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={selectedMembers.length === 0 || isSubmitting || deadlinePassed}
                className="flex-1 px-4 py-3 bg-[rgb(48,80,105)] text-white rounded-xl font-medium hover:bg-[rgb(48,80,105)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? t('saving') : t('save')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{t('navEvents')}</h2>
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
                  {event.time && (
                    <div className="flex items-center text-sm text-slate-600">
                      <Clock className="w-4 h-4 mr-2 text-slate-400" />
                      {event.time}
                    </div>
                  )}
                  {event.site && (
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                      {event.site}
                    </div>
                  )}
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
                  {user ? (
                    <button 
                      onClick={() => openRegistrationModal(event)}
                      disabled={isRegistrationDeadlinePassed(event)}
                      className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ${
                        isRegistrationDeadlinePassed(event)
                          ? 'text-slate-400 bg-slate-100 cursor-not-allowed opacity-50'
                          : 'text-white bg-[rgb(48,80,105)] hover:bg-white hover:text-[rgb(48,80,105)]'
                      }`}
                    >
                      {isRegistrationDeadlinePassed(event) ? t('registrationClosed') : t('join')}
                    </button>
                  ) : (
                    <div className="relative group">
                      <button disabled className="text-sm font-medium text-[rgb(48,80,105)] bg-white border-3 border-[rgb(48,80,105)] px-4 py-2 rounded-xl cursor-not-allowed opacity-75">
                        {t('join')}
                      </button>
                      <div className="absolute bottom-full mb-2 right-0 w-48 p-2 bg-[rgb(48,80,105)] text-white text-xs rounded-xl text-center z-10 shadow-lg hidden group-hover:block">
                        {t('loginToViewEvents')}
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

      {isRegistrationModalOpen && selectedEvent && (
        <EventRegistrationModal
          event={selectedEvent}
          onClose={() => {
            setIsRegistrationModalOpen(false);
            setSelectedEvent(null);
          }}
          onRegister={handleRegister}
          isRegistrationDeadlinePassed={isRegistrationDeadlinePassed}
        />
      )}
    </div>
  );
}

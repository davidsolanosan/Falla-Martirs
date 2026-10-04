import React, { useState, useEffect } from 'react';
import { useTranslation } from '../lib/i18n';
import { useSupabase } from '../lib/SupabaseContext';
import { format } from 'date-fns';
import { es, ca } from 'date-fns/locale';
import { CalendarDays, Users, Info, MapPin, ChevronDown, ChevronUp, Clock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Eventos() {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const { events, loading, users, families, eventPrices, createEventRegistration, updateEventRegistration, eventRegistrations, deleteEventRegistration, eventMealOptions, refreshEventPrices, fetchEventPricesForEvent } = useSupabase();

  const getEventRegistrations = (eventId: string) => {
    return eventRegistrations.filter((er: any) => er.event_id === eventId);
  };
  
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
    refreshEventPrices();
    setSelectedEvent(event);
    setIsRegistrationModalOpen(true);
  };

  // Función para abrir noticia del evento
  const openEventNews = (event) => {
    console.log('🔍 openEventNews llamado para evento:', event);
    
    if (event.news_id) {
      console.log('🔍 news_id encontrado:', event.news_id);
      
      try {
        // Abrir la noticia usando React Router navigate
        const newsUrl = `/noticias#news-${event.news_id}`;
        console.log('🔍 URL a abrir:', newsUrl);
        
        // Usar React Router para navegación interna
        navigate(newsUrl);
      } catch (error) {
        console.error('🔍 Error abriendo noticia:', error);
        alert(t('errorOpeningNews'));
      }
    } else {
      console.log('🔍 No hay news_id para el evento');
      // Mostrar mensaje si no hay noticia
      alert(t('noNewsAssociated'));
    }
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
  const handleRegister = async (memberIds, includesMeal, mealOptionId, event) => {
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

      // Consulta fresca de precios del evento (evita estado desactualizado del contexto)
      const eventPricesForEvent = await fetchEventPricesForEvent(event.id);
      console.log('🔍 Precios del evento:', eventPricesForEvent);

      if (eventPricesForEvent.length === 0) {
        console.error('❌ No hay precios configurados para este evento');
        alert(t('noEventPrices'));
        return;
      }

      for (const memberId of memberIds) {
        // Obtener categoría del miembro
        const member = users.find(u => u.id === memberId);
        const categoryId = member?.category_id;
        
        console.log('🔍 Procesando miembro:', { memberId, categoryId });
        
        if (!categoryId) {
          console.error('❌ El miembro no tiene categoría asignada:', memberId);
          alert(t('memberNoCategory'));
          continue;
        }
        
        // Buscar precio para la categoría específica
        let eventPrice = eventPricesForEvent.find(p => p.category_id === categoryId);
        let finalCategoryId = categoryId;
        
        if (!eventPrice) {
          console.warn('⚠️ No hay precio para la categoría específica, usando primera disponible');
          // Usar la primera categoría disponible como por defecto
          const defaultCategory = eventPricesForEvent[0]?.category_id;
          if (!defaultCategory) {
            console.error('❌ No hay categorías disponibles para este evento');
            alert(t('noEventCategories'));
            continue;
          }
          
          finalCategoryId = defaultCategory;
          console.log('🔧 Usando categoría por defecto:', finalCategoryId);
        }
        
        // Calcular el precio: categoría + suplemento de la opción elegida
        const finalEventPrice = eventPricesForEvent.find(p => p.category_id === finalCategoryId);

        const chosenOption = mealOptionId
          ? eventMealOptions.find(o => o.id === mealOptionId)
          : null;
        const mealCost = chosenOption
          ? chosenOption.extra_cost
          : (includesMeal && event.meal_cost ? event.meal_cost : 0);
        const calculatedPrice = (finalEventPrice?.price || 0) + mealCost;

        await createEventRegistration({
          event_id: event.id,
          user_id: memberId,
          family_id: userFamily?.id || '',
          category_id: categoryId,
          includes_meal: includesMeal,
          meal_option_id: mealOptionId || null,
          total_price: calculatedPrice,
          registered_by: user?.id || '',
          registered_at: new Date().toISOString()
        });
      }

      setIsRegistrationModalOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error al inscribir:', error);
      alert(t('errorRegistering'));
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
    
    // Inicializar memberMeals con las opciones de comida de usuarios ya inscritos
    const initialMemberMeals = {};
    initiallyRegisteredMembers.forEach(memberId => {
      const registration = eventRegistrations.find(r => r.event_id === event.id && r.user_id === memberId);
      if (registration) {
        initialMemberMeals[memberId] = registration.includes_meal || false;
        console.log('🔍 Cargando opción comida para miembro:', {
          memberId,
          registration,
          includes_meal: registration.includes_meal,
          valorGuardado: initialMemberMeals[memberId]
        });
      }
    });
    
    console.log('🔍 initialMemberMeals final:', initialMemberMeals);

    // Opciones de menú del evento (si las hay)
    const mealOptionsForEvent = eventMealOptions
      .filter(o => o.event_id === event.id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const hasMealOptions = mealOptionsForEvent.length > 0;

    const initialMemberOptions = {};
    initiallyRegisteredMembers.forEach(memberId => {
      const registration = eventRegistrations.find(r => r.event_id === event.id && r.user_id === memberId);
      if (registration) {
        initialMemberOptions[memberId] = registration.meal_option_id || null;
      }
    });

    const [selectedMembers, setSelectedMembers] = useState(initiallyRegisteredMembers);
    const [memberMeals, setMemberMeals] = useState(initialMemberMeals);
    const [memberMealOptions, setMemberMealOptions] = useState(initialMemberOptions);
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
      if (event.includes_meal) {
        if (hasMealOptions) {
          for (const id of selectedMembers) {
            const opt = mealOptionsForEvent.find(o => o.id === memberMealOptions[id]);
            total += opt?.extra_cost || 0;
          }
        } else if (event.meal_cost) {
          const membersWithMeal = selectedMembers.filter(id => memberMeals[id]).length;
          total += event.meal_cost * membersWithMeal;
        }
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
        setMemberMealOptions(prev => {
          const next = { ...prev };
          delete next[memberId];
          return next;
        });
      } else {
        // Si se selecciona, añadir con opción de comida por defecto (true si el evento incluye comida)
        setSelectedMembers([...selectedMembers, memberId]);
        setMemberMeals(prev => ({
          ...prev,
          [memberId]: event.includes_meal ? true : false // Por defecto marcado si el evento incluye comida
        }));
        setMemberMealOptions(prev => ({
          ...prev,
          [memberId]: hasMealOptions ? mealOptionsForEvent[0].id : null
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
            const optionId = memberMealOptions[memberId] || null;
            const includesMeal = hasMealOptions ? !!optionId : (memberMeals[memberId] || false);
            await onRegister([memberId], includesMeal, optionId, event);
          } else {
            // Miembro existente - actualizar opciones de comida si han cambiado
            const registration = eventRegistrations.find(r => r.event_id === event.id && r.user_id === memberId);
            const currentOptionId = registration?.meal_option_id || null;
            const newOptionId = memberMealOptions[memberId] || null;
            const currentMealOption = registration?.includes_meal || false;
            const newMealOption = hasMealOptions ? !!newOptionId : (memberMeals[memberId] || false);

            if (currentMealOption !== newMealOption || currentOptionId !== newOptionId) {
              // Calcular el precio para este miembro
              const member = familyMembers.find(m => m.id === memberId);
              const categoryId = member?.category_id || '';
              const finalEventPrice = eventPrices.find(p => p.event_id === event.id && p.category_id === categoryId);
              const categoryPrice = finalEventPrice?.price || 0;
              const option = newOptionId ? mealOptionsForEvent.find(o => o.id === newOptionId) : null;
              const mealCost = option ? option.extra_cost : (newMealOption && event.meal_cost ? event.meal_cost : 0);
              const calculatedPrice = categoryPrice + mealCost;

              // Actualizar la inscripción existente
              await updateEventRegistration(registration.id, {
                includes_meal: newMealOption,
                meal_option_id: newOptionId,
                total_price: calculatedPrice
              });
            }
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
                      selectedMembers.includes(member.id) ? 'bg-[rgb(48,80,105)]/10 border-[rgb(48,80,105)]/20' : 'hover:bg-slate-50'
                    }`}>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member.id)}
                          onChange={() => {
                            handleMemberToggle(member.id);
                          }}
                          disabled={deadlinePassed}
                          className={`mr-3 h-5 w-5 rounded focus:ring-2 focus:ring-offset-2 transition-colors ${
                            deadlinePassed
                              ? 'text-gray-300 cursor-not-allowed bg-gray-100 border-gray-300'
                              : selectedMembers.includes(member.id)
                                ? 'text-white bg-[rgb(48,80,105)] border-[rgb(48,80,105)]'
                                : 'text-[rgb(48,80,105)] bg-white border-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)]/5'
                          }`}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-lg">{member.name} {member.surname}</p>
                          <p className="text-sm text-slate-500">
                            {categoryPrice?.price || 0} €
                          </p>
                        </div>
                      </div>
                  
                  {selectedMembers.includes(member.id) && event.includes_meal && (
                    <div className="ml-8 p-3 bg-slate-50 rounded-lg">
                      {hasMealOptions ? (
                        <select
                          value={memberMealOptions[member.id] ?? ''}
                          onChange={(e) => setMemberMealOptions(prev => ({ ...prev, [member.id]: e.target.value || null }))}
                          disabled={deadlinePassed}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[rgb(48,80,105)] disabled:opacity-50"
                        >
                          <option value="">{t('withoutMeal')}</option>
                          {mealOptionsForEvent.map(o => (
                            <option key={o.id} value={o.id}>
                              {o.name}{o.extra_cost > 0 ? ` (+${o.extra_cost} €)` : ''}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center justify-between">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={memberMeals[member.id] || false}
                              onChange={() => handleMealToggle(member.id)}
                              className={`mr-3 h-4 w-4 rounded focus:ring-2 focus:ring-[rgb(48,80,105)] ${
                                memberMeals[member.id]
                                  ? 'text-[rgb(48,80,105)] bg-[rgb(48,80,105)]'
                                  : 'text-slate-600 bg-white border-slate-300'
                              }`}
                            />
                            {event.meal_type && (
                              <p className="text-sm text-slate-700 font-medium">{event.meal_type}</p>
                            )}
                          </label>
                        </div>
                      )}
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
              <h4 className="text-lg font-semibold text-slate-800 mb-4">{t('mealInformation')}</h4>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-slate-600">{t('menu')}:</span>
                    <span className="text-sm text-slate-800 ml-2">
                      {event.meal_type || t('notSpecified')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-slate-600">{t('additionalCost')}:</span>
                    <span className="text-sm text-slate-800 ml-2">
                      {event.meal_cost !== undefined && event.meal_cost !== null
                        ? `${event.meal_cost} €`
                        : t('free')
                      }
                    </span>
                  </div>
                  {hasMealOptions && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <span className="text-sm font-medium text-slate-600">{t('mealOptions')}:</span>
                      <ul className="mt-2 space-y-1">
                        {mealOptionsForEvent.map(o => (
                          <li key={o.id} className="flex items-center justify-between text-sm">
                            <span className="text-slate-800">{o.name}</span>
                            <span className="text-slate-600">{o.extra_cost > 0 ? `+${o.extra_cost} €` : t('free')}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-lg font-semibold">{t('total')}:</span>
                <p className="text-sm text-slate-500">
                  {selectedMembers.length} {selectedMembers.length === 1 ? t('person') : t('people')}
                  {event.includes_meal && selectedMembers.some(id => memberMeals[id]) && 
                    ` • ${selectedMembers.filter(id => memberMeals[id]).length} ${t('withMeal')}`
                  }
                </p>
              </div>
              <span className="text-2xl font-bold text-[rgb(48,80,105)]">{calculateTotal()} €</span>
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
                disabled={isSubmitting || deadlinePassed}
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

  // Separar eventos próximos de finalizados (comparando solo la fecha)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPastEvent = (event: any) => new Date(event.event_date) < today;
  const upcomingEvents = events
    .filter((e: any) => !isPastEvent(e))
    .sort((a: any, b: any) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  const pastEvents = events
    .filter(isPastEvent)
    .sort((a: any, b: any) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

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
        <>
        {upcomingEvents.length === 0 && (
          <p className="text-center text-slate-500 py-4">{t('noUpcomingEvents')}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...upcomingEvents, ...(showPastEvents ? pastEvents : [])].map(event => {
          const date = new Date(event.event_date);
          return (
            <div key={event.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-indigo-50 text-indigo-700 p-3 rounded-2xl text-center min-w-[70px]">
                    <p className="text-xs font-bold uppercase">{format(date, 'MMM', { locale: dateLocale })}</p>
                    <p className="text-2xl font-bold">{format(date, 'dd')}</p>
                  </div>
                  <span className={`inline-flex items-center justify-center p-2 rounded-full transition-colors ${
                    event.includes_meal 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`} title={event.includes_meal ? t('withFood') : t('withoutFood')}>
                    <img 
                      src="/icons/burger.ico" 
                      alt="Comida"
                      className={`w-5 h-5 transition-all ${
                        event.includes_meal 
                          ? 'opacity-100' 
                          : 'opacity-40 grayscale'
                      }`}
                    />
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
                  <h3 className="text-xl font-bold text-slate-800 flex-1">{event.title}</h3>
                  <div className="flex items-center text-sm text-slate-600 whitespace-nowrap">
                    <Users className="w-4 h-4 mr-1" />
                    {getEventRegistrations(event.id).length} {t('attendees')}
                  </div>
                </div>
                <div 
                  className="text-slate-500 text-sm mb-4 line-clamp-2 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline [&_div]:my-1 [&_br]:hidden max-w-none"
                  dangerouslySetInnerHTML={{ __html: event.description || '' }}
                />
                
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

                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-100 gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      event.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.is_active ? t('active') : t('inactive')}
                    </span>
                    <button 
                      onClick={() => openEventNews(event)}
                      className="text-sm font-medium px-3 py-1 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex items-center"
                      title={t('viewFullInfo')}
                      type="button"
                    >
                      <Info className="w-4 h-4 mr-1" />
                      + info
                    </button>
                  </div>
                  {user ? (
                    <button 
                      onClick={() => openRegistrationModal(event)}
                      disabled={isRegistrationDeadlinePassed(event)}
                      className={`text-sm font-medium px-4 py-2 rounded-xl transition-all w-full sm:w-auto ${
                        isRegistrationDeadlinePassed(event)
                          ? 'text-slate-400 bg-slate-100 cursor-not-allowed opacity-50'
                          : 'text-white bg-[rgb(48,80,105)] hover:bg-white hover:text-[rgb(48,80,105)]'
                      }`}
                    >
                      {isRegistrationDeadlinePassed(event) ? t('registrationClosed') : t('join')}
                    </button>
                  ) : (
                    <div className="relative group w-full sm:w-auto">
                      <button disabled className="text-sm font-medium text-[rgb(48,80,105)] bg-white border-3 border-[rgb(48,80,105)] px-4 py-2 rounded-xl cursor-not-allowed opacity-75 w-full sm:w-auto">
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

        {pastEvents.length > 0 && (
          <button
            onClick={() => setShowPastEvents(!showPastEvents)}
            className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <h2 className="text-lg font-semibold text-slate-700 flex items-center">
              {t('pastEvents')} ({pastEvents.length})
            </h2>
            {showPastEvents ? (
              <ChevronUp className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-600" />
            )}
          </button>
        )}
        </>
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

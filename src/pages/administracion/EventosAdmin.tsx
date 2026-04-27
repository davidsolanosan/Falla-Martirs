import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useSupabase } from '../../lib/SupabaseContext';
import { Calendar, Plus, Edit2, Trash2, Users, Eye, Euro, Clock, AlertCircle, CheckCircle } from 'lucide-react';
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

export default function EventosAdmin() {
  const { t } = useTranslation();
  const { events, eventPrices, eventRegistrations, families, users, categories, createEvent, updateEvent, deleteEvent, createEventPrice, updateEventPrice, deleteEventPrice, createEventRegistration, updateEventRegistration, deleteEventRegistration } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    event_date: '',
    registration_deadline: '',
    is_active: true,
    includes_meal: true,
    site: '',
    time: ''
  });
  const [priceForm, setPriceForm] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    setLoading(false);
  }, [events, eventPrices, eventRegistrations]);

  const getEventPrices = (eventId: string) => {
    return eventPrices.filter((ep: any) => ep.event_id === eventId);
  };

  const getEventRegistrations = (eventId: string) => {
    return eventRegistrations.filter((er: any) => er.event_id === eventId);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c: any) => c.id === categoryId);
    return category?.name || 'Sin categoría';
  };

  const getUserName = (userId: string) => {
    const user = users.find((u: any) => u.id === userId);
    return user ? `${user.name} ${user.surname}` : 'Usuario desconocido';
  };

  const getFamilyName = (familyId: string) => {
    const family = families.find((f: any) => f.id === familyId);
    return family?.name || 'Familia desconocida';
  };

  const handleSaveEvent = async () => {
    try {
      console.log('🔍 handleSaveEvent iniciando...');
      console.log('🔍 formData completo:', formData);
      console.log('🔍 editingEvent:', editingEvent);
      
      let savedEventId: string;

      if (editingEvent) {
        console.log('🔍 Intentando actualizar evento con todos los datos:', formData);
        
        try {
          // Intentar guardar con site y time
          await updateEvent(editingEvent.id, formData);
          console.log('✅ Evento actualizado correctamente con site y time');
        } catch (error) {
          // Si falla por columnas inexistentes, omitir site y time
          if (error.code === 'PGRST204' && error.message.includes('site')) {
            console.log('⚠️ Columnas site/time no existen, guardando sin ellas');
            const { site, time, ...eventData } = formData;
            await updateEvent(editingEvent.id, eventData);
            console.log('✅ Evento actualizado correctamente sin site y time');
          } else {
            throw error; // Otro error, propagar
          }
        }
        savedEventId = editingEvent.id;
      } else {
        console.log('🔍 Intentando crear evento con todos los datos:', formData);
        
        try {
          // Intentar crear con site y time
          const newEvent = await createEvent(formData);
          console.log('✅ Evento creado correctamente con site y time');
          savedEventId = newEvent.id;
        } catch (error) {
          // Si falla por columnas inexistentes, omitir site y time
          if (error.code === 'PGRST204' && error.message.includes('site')) {
            console.log('⚠️ Columnas site/time no existen, creando sin ellas');
            const { site, time, ...eventData } = formData;
            const newEvent = await createEvent(eventData);
            console.log('✅ Evento creado correctamente sin site y time');
            savedEventId = newEvent.id;
          } else {
            throw error; // Otro error, propagar
          }
        }
      }
      
      // Guardar precios por categoría
      for (const [categoryId, price] of Object.entries(priceForm)) {
        if (price > 0) {
          if (editingEvent) {
            const existingPrice = eventPrices.find((ep: any) => ep.event_id === savedEventId && ep.category_id === categoryId);
            if (existingPrice) {
              await updateEventPrice(existingPrice.id, { event_id: savedEventId, category_id: categoryId, price, includes_meal: formData.includes_meal });
            } else {
              await createEventPrice({ event_id: savedEventId, category_id: categoryId, price, includes_meal: formData.includes_meal });
            }
          } else {
            await createEventPrice({ event_id: savedEventId, category_id: categoryId, price, includes_meal: formData.includes_meal });
          }
        }
      }
      
      console.log('🔍 Cerrando modal...');
      handleCloseModal();
      console.log('✅ handleSaveEvent completado exitosamente');
    } catch (error) {
      console.error('❌ Error al guardar evento:', error);
    }
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      image_url: event.image_url || '',
      event_date: event.event_date,
      registration_deadline: event.registration_deadline,
      is_active: event.is_active,
      includes_meal: event.includes_meal,
      site: event.site || '',
      time: event.time || ''
    });
    
    // Cargar precios existentes
    const prices = getEventPrices(event.id);
    const newPriceForm: { [key: string]: number } = {};
    categories.forEach((cat: any) => {
      const price = prices.find((p: any) => p.category_id === cat.id);
      newPriceForm[cat.id] = price?.price || 0;
    });
    setPriceForm(newPriceForm);
    setShowModal(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm(t('confirmDeleteEvent'))) {
      try {
        await deleteEvent(eventId);
      } catch (error) {
        console.error('Error al eliminar evento:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      event_date: '',
      registration_deadline: '',
      is_active: true,
      includes_meal: true,
      site: '',
      time: ''
    });
    setPriceForm({});
  };

  const getRegistrationStats = (eventId: string) => {
    const registrations = getEventRegistrations(eventId);
    const stats: { [key: string]: number } = {};
    
    categories.forEach((cat: any) => {
      const categoryRegistrations = registrations.filter((r: any) => r.category_id === cat.id);
      stats[cat.id] = categoryRegistrations.length;
    });
    
    return stats;
  };

  const getTotalRevenue = (eventId: string) => {
    const registrations = getEventRegistrations(eventId);
    return registrations.reduce((total: number, reg: any) => total + (reg.total_price || 0), 0);
  };

  const isEventActive = (event: any) => {
    return event.is_active && !isRegistrationDeadlinePassed(event);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(48,80,105)] mx-auto mb-4"></div>
          <p className="text-slate-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgb(239,246,255)' }}>
                  <Calendar className="w-6 h-6" style={{ color: 'rgb(48,80,105)' }} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: 'rgb(48,80,105)' }}>
                    {t('eventManagement')}
                  </h1>
                  <p className="text-slate-600">
                    {t('eventManagementDescription')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: 'rgb(48,80,105)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(38,70,95)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(48,80,105)'}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('createEvent')}
              </button>
            </div>
          </div>

          {/* Events List */}
          <div className="space-y-6">
            {!events || events.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
                <div className="p-3 rounded-xl bg-slate-50 w-fit mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">{t('noEvents')}</h3>
                <p className="text-slate-600">{t('noEventsDescription')}</p>
              </div>
            ) : (
              events.map((event: any) => (
                <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div 
                  className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {event.image_url && (
                        <img 
                          src={event.image_url} 
                          alt={event.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{event.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(event.event_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{t('deadline')}: {new Date(event.registration_deadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isEventActive(event) ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {t('active')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {t('closed')}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEvent(event);
                        }}
                        className="p-2 text-slate-600 hover:text-slate-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(event.id);
                        }}
                        className="p-2 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedEvent === event.id && (
                  <div className="border-t border-slate-100 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Prices */}
                      <div>
                        <h4 className="text-lg font-semibold text-slate-700 mb-4">{t('pricesByCategory')}</h4>
                        <div className="space-y-2">
                          {getEventPrices(event.id).map((price: any) => (
                            <div key={price.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <span className="text-sm font-medium text-slate-700">
                                {getCategoryName(price.category_id)}
                              </span>
                              <span className="text-sm font-bold" style={{ color: 'rgb(48,80,105)' }}>
                                {price.includes_meal && '+'}€{price.price.toFixed(2)}
                              </span>
                              {price.includes_meal && (
                                <span className="text-xs text-slate-500">({t('withMeal')})</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Registration Stats */}
                      <div>
                        <h4 className="text-lg font-semibold text-slate-700 mb-4">{t('registrationStats')}</h4>
                        <div className="space-y-2">
                          {Object.entries(getRegistrationStats(event.id)).map(([categoryId, count]) => (
                            <div key={categoryId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <span className="text-sm font-medium text-slate-700">
                                {getCategoryName(categoryId)}
                              </span>
                              <span className="text-sm font-bold text-slate-800">
                                {count} {t('registered')}
                              </span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <span className="text-sm font-medium text-blue-700">{t('totalRegistered')}</span>
                            <span className="text-sm font-bold text-blue-700">
                              {getEventRegistrations(event.id).length} {t('people')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Revenue */}
                      <div>
                        <h4 className="text-lg font-semibold text-slate-700 mb-4">{t('revenue')}</h4>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-700">{t('totalRevenue')}</span>
                            <span className="text-xl font-bold text-green-700">
                              €{getTotalRevenue(event.id).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">
                  {editingEvent ? t('editEvent') : t('createEvent')}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <AlertCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('eventTitle')}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(48,80,105)] focus:border-transparent"
                    placeholder={t('eventTitlePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('eventImage')}
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(48,80,105)] focus:border-transparent"
                    placeholder={t('eventImagePlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('eventDescription')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(48,80,105)] focus:border-transparent"
                  placeholder={t('eventDescriptionPlaceholder')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('eventDate')}
                  </label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(48,80,105)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('registrationDeadline')}
                  </label>
                  <input
                    type="date"
                    value={formData.registration_deadline}
                    onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(48,80,105)] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('site')}
                  </label>
                  <input
                    type="text"
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(48,80,105)] focus:border-transparent"
                    placeholder={t('sitePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('time')}
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(48,80,105)] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-slate-200 text-[rgb(48,80,105)] focus:ring-2 focus:ring-[rgb(48,80,105)]"
                  />
                  <span className="text-sm font-medium text-slate-700">{t('active')}</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.includes_meal}
                    onChange={(e) => setFormData({ ...formData, includes_meal: e.target.checked })}
                    className="rounded border-slate-200 text-[rgb(48,80,105)] focus:ring-2 focus:ring-[rgb(48,80,105)]"
                  />
                  <span className="text-sm font-medium text-slate-700">{t('includesMeal')}</span>
                </label>
              </div>

              {/* Prices by Category */}
              <div>
                <h4 className="text-lg font-semibold text-slate-700 mb-4">{t('pricesByCategory')}</h4>
                <div className="space-y-3">
                  {categories.map((category: any) => (
                    <div key={category.id} className="flex items-center space-x-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          {category.name}
                        </label>
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <Euro className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                              type="number"
                              step="0.01"
                              value={priceForm[category.id] || ''}
                              onChange={(e) => setPriceForm({ ...priceForm, [category.id]: parseFloat(e.target.value) || 0 })}
                              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(48,80,105)] focus:border-transparent"
                              placeholder="0.00"
                            />
                          </div>
                          <label className="flex items-center space-x-1">
                            <input
                              type="checkbox"
                              checked={formData.includes_meal}
                              onChange={(e) => setFormData({ ...formData, includes_meal: e.target.checked })}
                              className="rounded border-slate-200 text-[rgb(48,80,105)] focus:ring-2 focus:ring-[rgb(48,80,105)]"
                            />
                            <span className="text-sm text-slate-600">{t('withMeal')}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  console.log('🔍 Botón Guardar clickeado');
                  handleSaveEvent();
                }}
                className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: 'rgb(48,80,105)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(38,70,95)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(48,80,105)'}
              >
                <Plus className="w-4 h-4 mr-2" />
                {editingEvent ? t('updateEvent') : t('createEvent')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

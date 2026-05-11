import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useSupabase } from '../../lib/SupabaseContext';
import { Calendar, Plus, Edit2, Trash2, Users, Eye, Euro, Clock, AlertCircle, CheckCircle, Download, Utensils } from 'lucide-react';
import * as XLSX from 'xlsx';
import TextEditor from '../../components/editor/TextEditor';
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
  const { events, eventPrices, eventRegistrations, families, users, categories, createEvent, updateEvent, deleteEvent, createEventPrice, updateEventPrice, deleteEventPrice, createEventRegistration, updateEventRegistration, deleteEventRegistration, createNews, updateNews } = useSupabase();
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
    meal_type: '', // Tipo de comida (ej: bocadillo de longanizas con tomate)
    meal_cost: '', // Coste adicional por persona
    site: '',
    time: '',
    news_id: '' // Relación con noticia generada
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
    return categories.find((c: any) => c.id === categoryId)?.name || '';
  };

  const getUserName = (userId: string) => {
    const user = users.find((u: any) => u.id === userId);
    return user ? `${user.name} ${user.surname}` : 'Usuario desconocido';
  };

  const getFamilyName = (familyId: string) => {
    const family = families.find((f: any) => f.id === familyId);
    return family?.name || 'Familia desconocida';
  };

  // Función para generar noticia automáticamente
  const generateEventNews = async (event: any) => {
    try {
      const newsContent = `
        <h2>📅 ${event.title}</h2>
        
        <h3>📋 Detalles del Evento:</h3>
        <p><strong>Fecha:</strong> ${event.event_date}</p>
        <p><strong>Hora:</strong> ${event.time || 'Por determinar'}</p>
        <p><strong>Lugar:</strong> ${event.site || 'Por determinar'}</p>
        <p><strong>Precio:</strong> Ver precios por categoría</p>
        <p><strong>Incluye comida:</strong> ${event.includes_meal ? 'Sí' : 'No'}</p>
        
        <h3>📝 Descripción:</h3>
        <div>${event.description || 'Sin descripción adicional'}</div>
        
        <h3>📅 Información de Inscripción:</h3>
        <p><strong>Fecha límite:</strong> ${event.registration_deadline}</p>
        <p><strong>Estado:</strong> ${event.is_active ? 'Activo' : 'Inactivo'}</p>
        
        <hr style="margin: 20px 0;">
        <p><em>Esta noticia se generó automáticamente para el evento "${event.title}".</em></p>
        <p><em>Para más información o inscribirte, visita la sección de Eventos.</em></p>
      `;

      const newsData = {
        title: `📅 ${event.title} - Información Completa`,
        content: newsContent,
        image_url: event.image_url,
        author: 'Sistema Automático',
        status: 'published' as const
      };

      let newsId = event.news_id;
      
      if (event.news_id) {
        // Actualizar noticia existente
        await updateNews(event.news_id, newsData);
        console.log('✅ Noticia actualizada:', event.news_id);
      } else {
        // Crear nueva noticia
        const newNews = await createNews(newsData);
        newsId = newNews.id;
        console.log('✅ Noticia creada:', newsId);
        
        // Actualizar evento con el ID de la noticia
        await updateEvent(event.id, { news_id: newsId });
        console.log('✅ Evento actualizado con news_id:', newsId);
      }

      return newsId;
    } catch (error) {
      console.error('❌ Error generando noticia:', error);
      throw error;
    }
  };

  const handleSaveEvent = async () => {
    try {
      console.log('🔍 handleSaveEvent iniciando...');
      
      // Validar campos requeridos
      if (!formData.title.trim()) {
        alert('El título del evento es obligatorio');
        return;
      }
      
      if (!formData.event_date) {
        alert('La fecha del evento es obligatoria');
        return;
      }
      
      if (!formData.registration_deadline) {
        alert('La fecha límite de inscripción es obligatoria');
        return;
      }
    
    // Convertir campos vacíos a null para evitar errores de tipo
    const processedFormData = {
      ...formData,
      meal_cost: formData.meal_cost === '' ? null : parseFloat(formData.meal_cost) || 0,
      event_date: formData.event_date === '' ? null : formData.event_date,
      registration_deadline: formData.registration_deadline === '' ? null : formData.registration_deadline
    };
    
    console.log('🔍 formData procesado:', processedFormData);
    console.log('🔍 editingEvent:', editingEvent);
      
      let savedEventId: string;

      if (editingEvent) {
        console.log('🔍 Intentando actualizar evento con todos los datos:', processedFormData);
        
        try {
          // Intentar guardar con todos los campos
          await updateEvent(editingEvent.id, processedFormData);
          console.log('✅ Evento actualizado correctamente con todos los campos');
        } catch (error) {
          // Si falla por columnas inexistentes, omitirlas
          if (error.code === 'PGRST204') {
            console.log('⚠️ Algunas columnas no existen, guardando sin ellas');
            const { site, time, meal_type, meal_cost, ...eventData } = processedFormData;
            await updateEvent(editingEvent.id, eventData);
            console.log('✅ Evento actualizado correctamente sin columnas inexistentes');
          } else {
            throw error; // Otro error, propagar
          }
        }
        savedEventId = editingEvent.id;
      } else {
        console.log('🔍 Intentando crear evento con todos los datos:', processedFormData);
        
        try {
          // Intentar crear con todos los campos
          const newEvent = await createEvent(processedFormData);
          console.log('✅ Evento creado correctamente con todos los campos');
          savedEventId = newEvent.id;
        } catch (error) {
          // Si falla por columnas inexistentes, omitirlas
          if (error.code === 'PGRST204') {
            console.log('⚠️ Algunas columnas no existen, creando sin ellas');
            const { site, time, meal_type, meal_cost, ...eventData } = processedFormData;
            const newEvent = await createEvent(eventData);
            console.log('✅ Evento creado correctamente sin columnas inexistentes');
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
      
      // Generar o actualizar noticia automáticamente
      try {
        const eventData = {
          ...processedFormData,
          id: savedEventId
        };
        await generateEventNews(eventData);
        console.log('✅ Noticia generada/actualizada automáticamente');
      } catch (newsError) {
        console.warn('⚠️ No se pudo generar la noticia automáticamente:', newsError);
        // No bloquear la creación del evento si falla la noticia
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
      meal_type: event.meal_type || '',
      meal_cost: event.meal_cost || '',
      site: event.site || '',
      time: event.time || '',
      news_id: event.news_id || ''
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
      meal_type: '',
      meal_cost: '',
      site: '',
      time: '',
      news_id: ''
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

  const getMealStats = (eventId: string) => {
    const registrations = getEventRegistrations(eventId);
    const withMeal = registrations.filter((reg: any) => reg.includes_meal).length;
    const withoutMeal = registrations.length - withMeal;
    return { withMeal, withoutMeal };
  };

  const exportToExcel = (eventId: string) => {
    const registrations = getEventRegistrations(eventId);
    const event = events.find((e: any) => e.id === eventId);
    
    if (!registrations.length) {
      alert(t('noRegistrationsToExport'));
      return;
    }

    const excelData = registrations.map((reg: any) => {
      const user = users.find((u: any) => u.id === reg.user_id);
      const family = families.find((f: any) => f.id === user?.family_id);
      const category = categories.find((c: any) => c.id === reg.category_id);
      
      return {
        'Nombre usuario': `${user?.name || ''} ${user?.surname || ''}`.trim(),
        'Familia': family?.name || '',
        'Categoría': category?.name || '',
        'Precio final': `€${reg.total_price || 0}`,
        'Comida': reg.includes_meal ? 'Sí' : 'No'
      };
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    
    // Limitar nombre de la hoja a 31 caracteres máximo
    const eventTitle = event?.title || 'Evento';
    const sheetName = `Inscripciones_${eventTitle}`.substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Formatear fecha como dd-mm-aaaa
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    XLSX.writeFile(wb, `Inscripciones_${event?.title || 'Evento'}_${formattedDate}.xlsx`);
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
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100 mt-5">
                            <span className="text-sm font-medium text-blue-700">{t('totalRegistered')}</span>
                            <span className="text-sm font-bold text-blue-700">
                              {getEventRegistrations(event.id).length} {t('people')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tercera columna: Meal Stats + Revenue + Export Button */}
                      <div className="space-y-6">
                        {/* Meal Stats */}
                        <div>
                          <h4 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                            <Utensils className="w-5 h-5 mr-2" />
                            {t('mealStats')}
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                              <span className="text-sm font-medium text-orange-700">{t('withMeal')}</span>
                              <span className="text-lg font-bold text-orange-700">
                                {getMealStats(event.id).withMeal} {t('people')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <span className="text-sm font-medium text-slate-700">{t('withoutMeal')}</span>
                              <span className="text-lg font-bold text-slate-700">
                                {getMealStats(event.id).withoutMeal} {t('people')}
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

                        {/* Export Button */}
                        <div>
                          <button
                            onClick={() => exportToExcel(event.id)}
                            className="w-full flex items-center justify-center p-3 hover:opacity-90 text-white rounded-lg transition-colors"
                            style={{ backgroundColor: 'rgb(48,80,105)' }}
                          >
                            <Download className="w-5 h-5 mr-2" />
                            {t('exportToExcel')}
                          </button>
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
                    {t('eventTitle')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(48,80,105)] focus:border-transparent"
                    placeholder={t('eventTitlePlaceholder')}
                    required
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
                  {t('eventDescription')} (Editor enriquecido - 600 caracteres)
                </label>
                <TextEditor
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder="Descripción detallada del evento con formato (negritas, colores, etc.)..."
                />
                <p className="text-xs text-slate-500 mt-1">
                  Usa el editor para dar formato al texto. La descripción se usará para generar automáticamente una noticia del evento.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('eventDate')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(48,80,105)] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('registrationDeadline')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.registration_deadline}
                    onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(48,80,105)] focus:border-transparent"
                    required
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

              {/* Meal Configuration */}
              {formData.includes_meal && (
                <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-slate-700">Configuración del Menú</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tipo de Comida
                    </label>
                    <input
                      type="text"
                      value={formData.meal_type}
                      onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
                      placeholder="Ej: bocadillo de longanizas con tomate"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(48,80,105)] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Coste Adicional por Persona (€)
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-600">€</span>
                      <input
                        type="number"
                        value={formData.meal_cost}
                        onChange={(e) => setFormData({ ...formData, meal_cost: e.target.value })}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(48,80,105)] focus:border-transparent"
                      />
                      <span className="text-sm text-slate-500">
                        {formData.meal_cost === '' || parseFloat(formData.meal_cost) === 0 ? 'Gratuito' : 'Coste por persona'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

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

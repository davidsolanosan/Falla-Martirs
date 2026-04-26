import React, { useState, useEffect } from 'react';
import { useTranslation } from '../lib/i18n';
import { useSupabase } from '../lib/SupabaseContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Image, Users, Clock, DollarSign, Check, X, Plus, Minus } from 'lucide-react';
import { Event, EventPrice, User, Family } from '../lib/supabase';

interface EventRegistrationModalProps {
  event: Event;
  eventPrices: EventPrice[];
  familyMembers: User[];
  onClose: () => void;
  onRegister: (selectedMembers: string[], includesMeal: boolean) => Promise<void>;
}

function EventRegistrationModal({ event, eventPrices, familyMembers, onClose, onRegister }: EventRegistrationModalProps) {
  const { t } = useTranslation();
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [includesMeal, setIncludesMeal] = useState<boolean>(true);
  const [isRegistering, setIsRegistering] = useState(false);

  // Calcular precio total
  const calculateTotal = () => {
    return selectedMembers.reduce((total, memberId) => {
      const member = familyMembers.find(m => m.id === memberId);
      if (!member) return total;
      
      const categoryPrice = eventPrices.find(p => p.category_id === member.category_id);
      return total + (categoryPrice?.price || 0);
    }, 0) + (includesMeal ? selectedMembers.length * 10 : 0); // 10€ extra por comida
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleRegister = async () => {
    if (selectedMembers.length === 0) {
      alert('Por favor, selecciona al menos un miembro de la familia');
      return;
    }

    setIsRegistering(true);
    try {
      await onRegister(selectedMembers, includesMeal);
      onClose();
    } catch (error) {
      console.error('Error al registrar en evento:', error);
      alert('Error al registrar en el evento. Por favor, inténtalo de nuevo.');
    } finally {
      setIsRegistering(false);
    }
  };

  const isEventExpired = () => {
    const eventDate = new Date(event.event_date);
    const today = new Date();
    const nextDay = new Date(eventDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return today > nextDay;
  };

  if (isEventExpired()) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="text-center">
            <X className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Evento Finalizado</h3>
            <p className="text-sm text-gray-600 mb-4">
              Este evento ya no está disponible para inscripciones.
            </p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-[rgb(48,80,105)] text-white rounded-lg hover:bg-[rgb(38,70,95)] transition-colors"
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('registerForEvent')}: {event.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información del evento */}
          <div className="bg-[rgb(239,246,255)] rounded-xl p-4">
            <div className="flex items-start space-x-3">
              {event.image_url && (
                <img 
                  src={event.image_url} 
                  alt={event.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(event.event_date).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {event.description && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-700">{event.description}</p>
              </div>
            )}
          </div>

          {/* Selector de miembros */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              {t('selectFamilyMembers')}
            </h3>
            <div className="space-y-2">
              {familyMembers.map(member => {
                const categoryPrice = eventPrices.find(p => p.category_id === member.category_id);
                const isSelected = selectedMembers.includes(member.id);
                
                return (
                  <div 
                    key={member.id}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer
                      ${isSelected 
                        ? 'border-[rgb(48,80,105)] bg-[rgb(239,246,255)]' 
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                    onClick={() => handleMemberToggle(member.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                        ${isSelected 
                          ? 'border-[rgb(48,80,105)] bg-[rgb(48,80,105)]' 
                          : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.name} {member.surname}
                        </p>
                        <p className="text-sm text-gray-600">
                          {member.category_id ? `Categoría: ${categoryPrice?.price || 0}€` : 'Sin categoría'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[rgb(48,80,105)]">
                        {categoryPrice?.price || 0}€
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Opción de comida */}
          <div className="bg-[rgb(239,246,255)] rounded-xl p-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includesMeal}
                onChange={(e) => setIncludesMeal(e.target.checked)}
                className="w-5 h-5 text-[rgb(48,80,105)] border-gray-300 rounded focus:ring-[rgb(48,80,105)]"
              />
              <div>
                <p className="font-medium text-gray-900">
                  {t('includeMeal')} (+{selectedMembers.length * 10}€)
                </p>
                <p className="text-sm text-gray-600">
                  {t('mealDescription')}
                </p>
              </div>
            </label>
          </div>

          {/* Resumen y total */}
          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('eventSubtotal')}</span>
                <span className="font-medium">
                  {selectedMembers.reduce((total, memberId) => {
                    const member = familyMembers.find(m => m.id === memberId);
                    const categoryPrice = eventPrices.find(p => p.category_id === member?.category_id);
                    return total + (categoryPrice?.price || 0);
                  }, 0)}€
                </span>
              </div>
              {includesMeal && selectedMembers.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('mealCost')}</span>
                  <span className="font-medium">+{selectedMembers.length * 10}€</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">{t('total')}</span>
                <span className="font-bold text-lg text-[rgb(48,80,105)]">
                  {calculateTotal()}€
                </span>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white text-[rgb(48,80,105)] border-2 border-[rgb(48,80,105)] rounded-lg hover:bg-[rgb(48,80,105)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[rgb(48,80,105)] focus:ring-offset-2 transition-all text-sm font-medium"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleRegister}
              disabled={isRegistering || selectedMembers.length === 0}
              className="flex-1 px-4 py-2 bg-[rgb(48,80,105)] text-white rounded-lg hover:bg-[rgb(38,70,95)] focus:outline-none focus:ring-2 focus:ring-[rgb(48,80,105)] focus:ring-offset-2 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegistering ? t('registering') : t('register')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventosUsuario() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { events, eventPrices, eventRegistrations, createEventRegistration } = useSupabase();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userFamily, setUserFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<User[]>([]);
  const [isRepresentative, setIsRepresentative] = useState(false);

  useEffect(() => {
    if (user?.family_id) {
      // Cargar información de la familia del usuario
      // Aquí deberías cargar la familia desde tu estado o desde Supabase
      // Por ahora, simulamos que tenemos la familia
      const mockFamily: Family = {
        id: user.family_id,
        name: 'Familia de Ejemplo',
        address: 'Dirección de Ejemplo',
        phone: '123456789',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setUserFamily(mockFamily);

      // Cargar miembros de la familia (simulado)
      const mockMembers: User[] = [
        {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          family_id: user.family_id,
          role: user.role,
          birth_year: user.birth_year,
          dni: user.dni || '',
          phone: user.phone || '',
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      ];
      setFamilyMembers(mockMembers);

      // Verificar si es representante (simulado)
      setIsRepresentative(true); // Asumimos que el usuario logueado es representante
    }
  }, [user]);

  // Filtrar eventos disponibles (no expirados)
  const availableEvents = events.filter(event => {
    const eventDate = new Date(event.event_date);
    const nextDay = new Date(eventDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return new Date() <= nextDay;
  });

  const handleRegister = async (selectedMembers: string[], includesMeal: boolean) => {
    if (!selectedEvent) return;

    // Registrar cada miembro seleccionado
    for (const memberId of selectedMembers) {
      await createEventRegistration({
        event_id: selectedEvent.id,
        user_id: memberId,
        family_id: userFamily?.id || '',
        category_id: familyMembers.find(m => m.id === memberId)?.category_id || '',
        includes_meal: includesMeal,
        total_price: 0, // Se calculará según el precio de la categoría
        registered_by: user?.id || ''
      });
    }
  };

  const openRegistrationModal = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const isEventExpired = (event: Event) => {
    const eventDate = new Date(event.event_date);
    const nextDay = new Date(eventDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return new Date() > nextDay;
  };

  const getEventStatus = (event: Event) => {
    const isRegistered = eventRegistrations.some(reg => 
      reg.event_id === event.id && familyMembers.some(member => member.id === reg.user_id)
    );
    
    if (isEventExpired(event)) {
      return { text: t('expired'), color: 'text-gray-500', bgColor: 'bg-gray-100' };
    }
    
    if (isRegistered) {
      return { text: t('registered'), color: 'text-green-600', bgColor: 'bg-green-100' };
    }
    
    return { text: t('available'), color: 'text-blue-600', bgColor: 'bg-blue-100' };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[rgb(239,246,255)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[rgb(48,80,105)] mb-4">
            {t('loginRequired')}
          </h1>
          <p className="text-gray-600">
            {t('loginToViewEvents')}
          </p>
        </div>
      </div>
    );
  }

  if (!isRepresentative) {
    return (
      <div className="min-h-screen bg-[rgb(239,246,255)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[rgb(48,80,105)] mb-4">
            {t('representativeOnly')}
          </h1>
          <p className="text-gray-600">
            {t('onlyRepresentativesCanRegister')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(239,246,255)]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[rgb(48,80,105)] mb-2">
            {t('events')}
          </h1>
          <p className="text-gray-600">
            {t('eventsDescription')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableEvents.map(event => {
            const status = getEventStatus(event);
            const isExpired = isEventExpired(event);
            
            return (
              <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {event.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={event.image_url} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 flex-1">
                      {event.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                      {status.text}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.event_date).toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.description && (
                      <p className="line-clamp-2">{event.description}</p>
                    )}
                  </div>

                  {/* Precios por categoría */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">{t('pricesByCategory')}</h4>
                    <div className="space-y-1">
                      {eventPrices
                        .filter(price => price.event_id === event.id)
                        .map(price => (
                          <div key={price.category_id} className="flex justify-between text-sm">
                            <span className="text-gray-600">Categoría {price.category_id}</span>
                            <span className="font-medium text-[rgb(48,80,105)]">{price.price}€</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <button
                    onClick={() => openRegistrationModal(event)}
                    disabled={isExpired}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-all
                      ${isExpired 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-[rgb(48,80,105)] text-white hover:bg-[rgb(38,70,95)]'
                      }`}
                  >
                    {isExpired ? t('eventExpired') : t('register')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {availableEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('noEventsAvailable')}
            </h3>
            <p className="text-gray-600">
              {t('noEventsDescription')}
            </p>
          </div>
        )}

        {/* Modal de inscripción */}
        {isModalOpen && selectedEvent && (
          <EventRegistrationModal
            event={selectedEvent}
            eventPrices={eventPrices.filter(p => p.event_id === selectedEvent.id)}
            familyMembers={familyMembers}
            onClose={closeModal}
            onRegister={handleRegister}
          />
        )}
      </div>
    </div>
  );
}

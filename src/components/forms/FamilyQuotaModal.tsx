import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { useTranslation } from '../../lib/i18n';
import { Family, User, Category, MonthlyPayment } from '../../types';
import { calculateMonthlyPayment, calculateFamilyMonthlyPayment } from '../../lib/quotaCalculator';
import { useSupabase } from '../../lib/SupabaseContext';
import { ChevronDown, ChevronUp, Calendar, Users } from 'lucide-react';

interface FamilyQuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  family: Family;
  familyUsers: User[];
  categories: Category[];
  onUpdate: () => void;
}

export function FamilyQuotaModal({ 
  isOpen, 
  onClose, 
  family, 
  familyUsers, 
  categories,
  onUpdate 
}: FamilyQuotaModalProps) {
  const { t } = useTranslation();
  const { events, eventRegistrations } = useSupabase();
  
  // Estado para controlar el desplegable de eventos
  const [eventsExpanded, setEventsExpanded] = useState(false);
  
  // Estado para las papeletas de cada usuario
  const [userLotteryTickets, setUserLotteryTickets] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    familyUsers.forEach(user => {
      initial[user.id] = user.monthlyPayment?.lotteryTickets || 0;
    });
    return initial;
  });

  // Calcular los pagos mensuales para cada usuario
  const usersWithPayments = useMemo(() => {
    return familyUsers.map(user => {
      const category = categories.find(c => c.id === user.categoryId);
      if (!category) return { ...user, monthlyPayment: undefined };
      
      const lotteryTickets = userLotteryTickets[user.id] || 0;
      const monthlyPayment = calculateMonthlyPayment(user, category, lotteryTickets);
      
      return {
        ...user,
        monthlyPayment
      };
    });
  }, [familyUsers, categories, userLotteryTickets]);

  // Calcular el total familiar
  const familyTotal = useMemo(() => {
    return calculateFamilyMonthlyPayment(usersWithPayments, categories);
  }, [usersWithPayments, categories]);

  // Calcular eventos de la familia
  const familyEvents = useMemo(() => {
    if (!family.id || !events.length || !eventRegistrations.length) return [];
    
    // Obtener inscripciones de los miembros de la familia
    const familyUserIds = familyUsers.map(user => user.id);
    const familyEventRegistrations = eventRegistrations.filter(reg => 
      familyUserIds.includes(reg.user_id)
    );
    
    // Agrupar por evento y calcular totales
    const eventsMap = new Map();
    
    familyEventRegistrations.forEach(registration => {
      const event = events.find(e => e.id === registration.event_id);
      if (!event) return;
      
      if (!eventsMap.has(event.id)) {
        eventsMap.set(event.id, {
          event,
          attendees: 0,
          totalCost: 0
        });
      }
      
      const eventData = eventsMap.get(event.id);
      eventData.attendees += 1;
      eventData.totalCost += registration.total_price || 0;
    });
    
    return Array.from(eventsMap.values());
  }, [family.id, events, eventRegistrations, familyUsers]);

  // Calcular coste total de eventos
  const eventsTotalCost = useMemo(() => {
    return familyEvents.reduce((total, event) => total + event.totalCost, 0);
  }, [familyEvents]);

  const handleLotteryTicketsChange = (userId: string, tickets: number) => {
    setUserLotteryTickets(prev => ({
      ...prev,
      [userId]: Math.max(0, tickets)
    }));
  };

  const handleSave = async () => {
    try {
      // Temporal: solo mostrar mensaje de éxito
      alert('Cuotas familiares guardadas correctamente (temporal)');
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error saving family quotas:", error);
      alert("Error al guardar las cuotas familiares. Revisa la consola para más detalles.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Gestionar Cuotas - ${family.name}`} maxWidth="max-w-4xl">
      <div className="space-y-6">
        {/* Resumen familiar */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="font-semibold text-slate-900 mb-3">Resumen Familiar</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Cuota familiar:</span>
              <p className="font-semibold text-lg">€{familyTotal.totalAmount.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-slate-500">Coste eventos:</span>
              <p className="font-semibold text-lg text-orange-600">€{eventsTotalCost.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-slate-500">Total a pagar:</span>
              <p className="font-semibold text-lg text-[rgb(48,80,105)]">€{(familyTotal.totalAmount + eventsTotalCost).toFixed(2)}</p>
            </div>
            <div>
              <span className="text-slate-500">Total papeletas:</span>
              <p className="font-semibold text-lg">{familyTotal.lotteryTickets}</p>
            </div>
          </div>
        </div>

        {/* Desplegable de Eventos */}
        {familyEvents.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setEventsExpanded(!eventsExpanded)}
              className="w-full px-6 py-4 flex items-center justify-between bg-[rgb(48,80,105)] text-white hover:bg-[rgb(48,80,105)]/90 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">{t('events')}</span>
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                  {familyEvents.length}
                </span>
              </div>
              {eventsExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            
            {eventsExpanded && (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-medium text-slate-700">
                          {t('eventName')}
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-slate-700">
                          {t('attendees')}
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-slate-700">
                          {t('totalCost')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {familyEvents.map((familyEvent, index) => (
                        <tr 
                          key={familyEvent.event.id} 
                          className={`border-b ${
                            index % 2 === 0 ? 'bg-slate-50' : 'bg-white'
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-900">
                              {familyEvent.event.title}
                            </div>
                            <div className="text-sm text-slate-500">
                              {new Date(familyEvent.event.event_date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <Users className="w-4 h-4 text-slate-400" />
                              <span className="font-medium text-slate-900">
                                {familyEvent.attendees}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-semibold text-orange-600">
                              €{familyEvent.totalCost.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-300">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {t('total')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-slate-900">
                            {familyEvents.reduce((sum, e) => sum + e.attendees, 0)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-lg text-[rgb(48,80,105)]">
                            €{eventsTotalCost.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lista de falleros */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">Falleros de la Familia</h3>
          <div className="space-y-3">
            {usersWithPayments.map(user => {
              const category = categories.find(c => c.id === user.categoryId);
              const payment = user.monthlyPayment;
              
              return (
                <div key={user.id} className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-slate-900">
                        {user.apellidos && `${user.apellidos}, `}{user.name}
                      </h4>
                      <p className="text-sm text-slate-500">
                        Categoría: {category?.name} - Cuota: €{category?.quotaamount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  {payment && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Papeletas de Lotería (€0.50 cada una)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={userLotteryTickets[user.id] || 0}
                          onChange={(e) => handleLotteryTicketsChange(user.id, Number(e.target.value))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Total:</span>
                          <span className="font-medium">€{payment.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Papeletas:</span>
                          <span className="font-medium text-green-600">€{payment.lotteryAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Dinero:</span>
                          <span className="font-medium text-blue-600">€{payment.moneyAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="pt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition-colors"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </Modal>
  );
}

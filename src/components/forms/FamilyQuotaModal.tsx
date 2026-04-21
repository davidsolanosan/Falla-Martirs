import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { useTranslation } from '../../lib/i18n';
import { Family, User, Category, MonthlyPayment } from '../../types';
import { calculateMonthlyPayment, calculateFamilyMonthlyPayment } from '../../lib/quotaCalculator';

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
              <span className="text-slate-500">Total mensual:</span>
              <p className="font-semibold text-lg">€{familyTotal.totalAmount.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-slate-500">En papeletas:</span>
              <p className="font-semibold text-lg text-green-600">€{familyTotal.lotteryAmount.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-slate-500">En dinero:</span>
              <p className="font-semibold text-lg text-blue-600">€{familyTotal.moneyAmount.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-slate-500">Total papeletas:</span>
              <p className="font-semibold text-lg">{familyTotal.lotteryTickets}</p>
            </div>
          </div>
        </div>

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

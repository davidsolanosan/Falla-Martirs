import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useTranslation } from '../../lib/i18n';

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentFormModal({ isOpen, onClose }: PaymentFormModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    familyId: '',
    amount: '',
    paymentDate: '',
    paymentMethod: 'cash',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar registro de pago
    console.log('Registering payment:', formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('registerPayment')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Familia
          </label>
          <select
            value={formData.familyId}
            onChange={(e) => setFormData({...formData, familyId: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          >
            <option value="">Selecciona una familia</option>
            <option value="1">Familia Pérez</option>
            <option value="2">Familia García</option>
            <option value="3">Familia Martínez</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad (¥)
          </label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="0.00"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Pago
          </label>
          <input
            type="date"
            value={formData.paymentDate}
            onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Método de Pago
          </label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="cash">Efectivo</option>
            <option value="transfer">Transferencia</option>
            <option value="card">Tarjeta</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            rows={3}
            placeholder="Notas adicionales..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

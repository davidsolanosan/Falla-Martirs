import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useData } from '../../lib/DataContext';
import { useTranslation } from '../../lib/i18n';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentFormModal({ isOpen, onClose }: PaymentFormModalProps) {
  const { families } = useData();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    familyId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // For now, we just log it or add to a 'payments' collection if it existed
      // Since we don't have a payments collection in the blueprint, we might just update family status
      // In a real app, we'd add a payment record.
      alert("Payment registered successfully (Mock)");
      onClose();
      setFormData({
        familyId: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error("Error registering payment:", error);
      alert("Error registering payment. Check console for details.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('registerPayment')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('family')}</label>
          <select
            required
            value={formData.familyId}
            onChange={(e) => setFormData({ ...formData, familyId: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Family</option>
            {families.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Amount (€)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('date')}</label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            {t('save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

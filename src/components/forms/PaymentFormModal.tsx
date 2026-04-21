import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useSupabase } from '../../lib/SupabaseContext';
import { useTranslation } from '../../lib/i18n';

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentFormModal({ isOpen, onClose }: PaymentFormModalProps) {
  const { families, createQuota } = useSupabase();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    family_id: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create a quota record for the payment
      await createQuota({
        family_id: formData.family_id,
        year: new Date().getFullYear(),
        amount: formData.amount,
        paid: true,
        payment_date: formData.date
      });
      
      alert("Payment registered successfully");
      onClose();
      setFormData({
        family_id: '',
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
            value={formData.family_id}
            onChange={(e) => setFormData({ ...formData, family_id: e.target.value })}
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
            className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors text-sm"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            className="w-full flex items-center justify-center bg-white text-[rgb(48,80,105)] border-3 border-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)] hover:text-white px-3 py-1.5 rounded-xl font-medium transition-all shadow-sm text-sm"
          >
            {t('save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

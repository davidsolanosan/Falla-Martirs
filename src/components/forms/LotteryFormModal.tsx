import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useTranslation } from '../../lib/i18n';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Lottery } from '../../types';

interface LotteryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LotteryFormModal({ isOpen, onClose }: LotteryFormModalProps) {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<Partial<Lottery>>({
    name: '',
    totalTickets: 0,
    assignedToFamily: {},
    soldByFamily: {}
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'lotteries'), {
        ...formData,
        totalTickets: Number(formData.totalTickets)
      });
      onClose();
      setFormData({
        name: '',
        totalTickets: 0,
        assignedToFamily: {},
        soldByFamily: {}
      });
    } catch (error) {
      console.error("Error adding lottery:", error);
      alert("Error adding lottery. Check console for details.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('assignTickets')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('name')}</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ej: Lotería de Navidad"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Total Tickets</label>
          <input
            type="number"
            min="0"
            required
            value={formData.totalTickets}
            onChange={(e) => setFormData({ ...formData, totalTickets: Number(e.target.value) })}
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

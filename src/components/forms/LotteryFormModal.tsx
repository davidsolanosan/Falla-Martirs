import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useTranslation } from '../../lib/i18n';
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
    price: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Temporal: solo mostrar mensaje de éxito
      alert('Lotería creada correctamente (temporal)');
      onClose();
    } catch (error) {
      console.error("Error saving lottery:", error);
      alert("Error al guardar lotería. Revisa la consola para más detalles.");
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
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            placeholder="Ej: Lotería de Navidad"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('totalTickets')}</label>
          <input
            type="number"
            min="0"
            required
            value={formData.totalTickets}
            onChange={(e) => setFormData({ ...formData, totalTickets: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('price')}</label>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
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

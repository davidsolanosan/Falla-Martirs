import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useTranslation } from '../../lib/i18n';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Event } from '../../types';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EventFormModal({ isOpen, onClose }: EventFormModalProps) {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    price: 0,
    attendees: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'events'), {
        ...formData,
        date: new Date(formData.date!).toISOString(),
        price: Number(formData.price)
      });
      onClose();
      setFormData({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        price: 0,
        attendees: []
      });
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Error adding event. Check console for details.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('createEvent')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('name')}</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('description')}</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('date')}</label>
          <input
            type="date"
            required
            value={formData.date?.split('T')[0]}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

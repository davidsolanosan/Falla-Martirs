import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useTranslation } from '../../lib/i18n';

interface LotteryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LotteryFormModal({ isOpen, onClose }: LotteryFormModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    totalTickets: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar creación de lotería
    console.log('Creating lottery:', formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('newLottery')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('name')}
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder={t('name')}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            rows={3}
            placeholder="Describe la lotería..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio (¥)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('totalTickets')}
            </label>
            <input
              type="number"
              value={formData.totalTickets}
              onChange={(e) => setFormData({...formData, totalTickets: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="100"
              required
            />
          </div>
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
            {t('create')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

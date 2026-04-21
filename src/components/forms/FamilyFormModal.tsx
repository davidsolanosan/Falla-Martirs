import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useSupabase } from '../../lib/SupabaseContext';
import { useTranslation } from '../../lib/i18n';
import { Family } from '../../types';

interface FamilyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyToEdit?: Family | null;
}

export function FamilyFormModal({ isOpen, onClose, familyToEdit }: FamilyFormModalProps) {
  const { createFamily, updateFamily } = useSupabase();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<Partial<Family>>({
    name: '',
    address: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (familyToEdit && familyToEdit.id) {
        // Update existing family
        await updateFamily(familyToEdit.id, {
          name: formData.name,
          address: formData.address,
          phone: formData.phone
        });
      } else {
        // Create new family
        await createFamily({
          name: formData.name || '',
          address: formData.address || '',
          phone: formData.phone || ''
        });
      }
      
      onClose();
    } catch (error) {
      console.error("Error saving family:", error);
      alert("Error al guardar familia. Revisa la consola para más detalles.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={familyToEdit ? t('editFamily') : t('addFamily')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('familyName')}</label>
          <input
            type="text"
            required
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={t('familyNamePlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('address')}</label>
          <input
            type="text"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={t('addressPlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('phone')}</label>
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={t('phonePlaceholder')}
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
            {familyToEdit ? t('update') : t('create')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useTranslation } from '../../lib/i18n';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Category } from '../../types';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
}

export function CategoryFormModal({ isOpen, onClose, category }: CategoryFormModalProps) {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    quotaAmount: 0,
    minAge: undefined,
    maxAge: undefined
  });

  // Initialize form with category data when editing
  React.useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        quotaAmount: category.quotaAmount,
        minAge: category.minAge,
        maxAge: category.maxAge
      });
    } else {
      setFormData({
        name: '',
        quotaAmount: 0,
        minAge: undefined,
        maxAge: undefined
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (category) {
        // Edit existing category
        await updateDoc(doc(db, 'categories', category.id), {
          ...formData,
          quotaAmount: Number(formData.quotaAmount)
        });
      } else {
        // Add new category
        await addDoc(collection(db, 'categories'), {
          ...formData,
          quotaAmount: Number(formData.quotaAmount)
        });
      }
      onClose();
      setFormData({
        name: '',
        quotaAmount: 0,
        minAge: undefined,
        maxAge: undefined
      });
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Error saving category. Check console for details.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={category ? t('editCategory') : t('addCategory')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('categoryType')}</label>
          <input
            type="text"
            required
            placeholder="Ej: Fallero Infantil (0-12 años), Fallero Mayor (18+ años), Jubilado (65+ años)..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-slate-500 mt-1">{t('categoryByBirthdate')}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('ageRange')}</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t('minAge')}</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="120"
                  placeholder="0"
                  value={formData.minAge || ''}
                  onChange={(e) => setFormData({ ...formData, minAge: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-500">{t('years')}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t('maxAge')}</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="120"
                  placeholder="99"
                  value={formData.maxAge || ''}
                  onChange={(e) => setFormData({ ...formData, maxAge: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-500">{t('years')}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">{t('ageRangeDescription')}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('monthlyQuota')}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">€</span>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="0.00"
              value={formData.quotaAmount}
              onChange={(e) => setFormData({ ...formData, quotaAmount: Number(e.target.value) })}
              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">Cantidad que cada fallero de esta categoría paga mensualmente</p>
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

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useSupabase } from '../../lib/SupabaseContext';
import { useTranslation } from '../../lib/i18n';
import { Category } from '../../types';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
}

export function CategoryFormModal({ isOpen, onClose, category }: CategoryFormModalProps) {
  const { createCategory, updateCategory } = useSupabase();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    min_age: undefined,
    max_age: undefined,
    quotaAmount: 0
  });

  // Initialize form with category data when editing
  React.useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        min_age: category.min_age,
        max_age: category.max_age,
        quotaAmount: category.quotaamount // <-- Corregido: usar quotaamount de la BD
      });
    } else {
      setFormData({
        name: '',
        min_age: undefined,
        max_age: undefined,
        quotaAmount: 0
      });
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const supabaseUrl = 'https://ojhebvlzhoeaabkbifvy.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaGVidmx6aG9lYWFia2JpZnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMTkyNzcsImV4cCI6MjA5MDY5NTI3N30.etDN7WIrYUg4Af7DFyQQDlv4Yb0QWub5qhSbgvDQLxo';
      
      const payload = {
        name: formData.name,
        quotaamount: formData.quotaAmount, // <-- Corregido: quotaamount en minúsculas
        min_age: formData.min_age,
        max_age: formData.max_age
      };
      
      console.log('🔍 Enviando payload:', payload);
      console.log('🔍 Category ID:', category?.id);
      
      if (category) {
        // Edit existing category via REST API
        const url = `${supabaseUrl}/rest/v1/categories?id=eq.${category.id}`;
        console.log('🔍 URL PATCH:', url);
        
        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          body: JSON.stringify(payload)
        });
        
        console.log('🔍 Response status:', response.status);
        console.log('🔍 Response headers:', response.headers);
        
        const responseText = await response.text();
        console.log('🔍 Response body:', responseText);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
        }
      } else {
        // Add new category via REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/categories`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      // Forzar recarga completa
      setTimeout(() => {
        window.location.href = window.location.href + '?t=' + Date.now();
      }, 100);
      
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
                  value={formData.min_age || ''}
                  onChange={(e) => setFormData({ ...formData, min_age: e.target.value ? Number(e.target.value) : undefined })}
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
                  value={formData.max_age || ''}
                  onChange={(e) => setFormData({ ...formData, max_age: e.target.value ? Number(e.target.value) : undefined })}
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
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-slate-500">€</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.quotaAmount || ''}
              onChange={(e) => setFormData({ ...formData, quotaAmount: e.target.value ? Number(e.target.value) : 0 })}
              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">{t('quotaDescription')}</p>
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

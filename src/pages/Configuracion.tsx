import React, { useState } from 'react';
import { useData } from '../lib/DataContext';
import { useTranslation } from '../lib/i18n';
import { Settings, Plus, Edit2, Trash2 } from 'lucide-react';
import { CategoryFormModal } from '../components/forms/CategoryFormModal';
import { Category } from '../types';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Configuracion() {
  const { categories } = useData();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'categorias' | 'general' | 'roles'>('general');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const handleEditCategory = (category: Category) => {
    setCategoryToEdit(category);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm(t('deleteCategory') + '?')) {
      try {
        await deleteDoc(doc(db, 'categories', categoryId));
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Error deleting category. Check console for details.");
      }
    }
  };

  const handleOpenCategoryModal = () => {
    setCategoryToEdit(null);
    setIsCategoryModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{t('navSettings')}</h2>
        <button 
          onClick={handleOpenCategoryModal}
          className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('addCategory')}
        </button>
      </div>

      <div className="flex space-x-1 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 max-w-lg">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'general' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {t('generalSettings')}
        </button>
        <button
          onClick={() => setActiveTab('categorias')}
          className={`flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'categorias' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {t('quotaCategories')}
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'roles' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {t('roles')}
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {activeTab === 'general' ? (
          <div className="p-6 space-y-6">
            <div className="text-center text-slate-500">
              <Settings className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-lg font-medium mb-2">{t('generalSettings')}</p>
              <p className="text-sm">{t('generalConfigDescription')}</p>
            </div>
          </div>
        ) : activeTab === 'categorias' ? (
          <div className="divide-y divide-slate-100">
            {categories.map(cat => (
              <div key={cat.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-base font-bold text-slate-800">{cat.name}</h4>
                  <p className="text-sm text-slate-500">{t('monthlyQuota')}: €{cat.quotaAmount.toFixed(2)}</p>
                  {(cat.minAge !== undefined || cat.maxAge !== undefined) && (
                    <p className="text-sm text-slate-500">
                      {t('ageRange')}: {cat.minAge !== undefined ? `${cat.minAge} años` : '0 años'} - {cat.maxAge !== undefined ? `${cat.maxAge} años` : '∞'}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">{t('categoryDescription')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEditCategory(cat)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                    title={t('editCategory')}
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title={t('deleteCategory')}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <Settings className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <p className="text-lg font-medium mb-2">{t('noCategoriesConfigured')}</p>
                <p className="text-sm">{t('createCategoriesDescription')}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center text-slate-500">
            <Settings className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p>{t('rolesComingSoon')}</p>
          </div>
        )}
      </div>

      <CategoryFormModal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
        category={categoryToEdit}
      />
    </div>
  );
}

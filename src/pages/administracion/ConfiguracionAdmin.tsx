import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useSupabase } from '../../lib/SupabaseContext';
import { Settings, Users, Ticket, Plus, Edit2, Trash2, Save, X, DollarSign } from 'lucide-react';

export default function ConfiguracionAdmin() {
  const { t } = useTranslation();
  const { categories, lotteryDates, createCategory, updateCategory, deleteCategory, updateLotteryDate, refreshCategories, refreshLotteryDates } = useSupabase();
  
  const [activeTab, setActiveTab] = useState('categories');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLotteryModal, setShowLotteryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingLottery, setEditingLottery] = useState<any>(null);
  
  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    quotaamount: 0,
    min_age: 0,
    max_age: 100
  });
  
  const [lotteryForm, setLotteryForm] = useState({
    ordinary_benefit: 0.40,
    christmas_benefit: 5.00,
    child_benefit: 3.00,
    horta_benefit: 2.50
  });

  useEffect(() => {
    refreshCategories();
    refreshLotteryDates();
  }, []);

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryForm);
      } else {
        await createCategory(categoryForm);
      }
      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', quotaamount: 0, min_age: 0, max_age: 100 });
      await refreshCategories();
    } catch (error) {
      console.error('Error guardando categoría:', error);
      alert(t('errorSavingCategory'));
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm(t('confirmDeleteCategory'))) {
      try {
        await deleteCategory(id);
        await refreshCategories();
      } catch (error) {
        console.error('Error eliminando categoría:', error);
        alert(t('errorDeletingCategory'));
      }
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      quotaamount: category.quotaamount,
      min_age: category.min_age,
      max_age: category.max_age
    });
    setShowCategoryModal(true);
  };

  const handleSaveLotteryBenefits = async () => {
    try {
      // Actualizar todos los sorteos ordinarios
      const ordinaryLotteries = lotteryDates.filter((ld: any) => ld.lottery_type === 'ordinary');
      for (const lottery of ordinaryLotteries) {
        await updateLotteryDate(lottery.id, { ordinary_benefit: lotteryForm.ordinary_benefit });
      }

      // Actualizar sorteos extraordinarios
      const christmasLottery = lotteryDates.find((ld: any) => ld.lottery_type === 'christmas');
      const childLottery = lotteryDates.find((ld: any) => ld.lottery_type === 'child');
      const hortaLottery = lotteryDates.find((ld: any) => ld.lottery_type === 'horta');

      if (christmasLottery) await updateLotteryDate(christmasLottery.id, { christmas_benefit: lotteryForm.christmas_benefit });
      if (childLottery) await updateLotteryDate(childLottery.id, { child_benefit: lotteryForm.child_benefit });
      if (hortaLottery) await updateLotteryDate(hortaLottery.id, { horta_benefit: lotteryForm.horta_benefit });

      setShowLotteryModal(false);
      await refreshLotteryDates();
      alert(t('benefitsUpdated'));
    } catch (error) {
      console.error('Error actualizando beneficios:', error);
      alert(t('errorUpdatingBenefits'));
    }
  };

  const getCurrentBenefits = () => {
    const ordinary = lotteryDates.find((ld: any) => ld.lottery_type === 'ordinary');
    const christmas = lotteryDates.find((ld: any) => ld.lottery_type === 'christmas');
    const child = lotteryDates.find((ld: any) => ld.lottery_type === 'child');
    const horta = lotteryDates.find((ld: any) => ld.lottery_type === 'horta');

    return {
      ordinary_benefit: ordinary?.ordinary_benefit || 0.40,
      christmas_benefit: christmas?.christmas_benefit || 5.00,
      child_benefit: child?.child_benefit || 3.00,
      horta_benefit: horta?.horta_benefit || 2.50
    };
  };

  useEffect(() => {
    setLotteryForm(getCurrentBenefits());
  }, [lotteryDates]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgb(239,246,255)' }}>
              <Settings className="w-6 h-6" style={{ color: 'rgb(48,80,105)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'rgb(48,80,105)' }}>
                {t('generalSettings')}
              </h1>
              <p className="text-slate-600">
                {t('configGeneralDescription')}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-8">
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center px-6 py-4 font-medium transition-colors ${
                activeTab === 'categories'
                  ? 'text-[rgb(48,80,105)] border-b-2 border-[rgb(48,80,105)]'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Users className="w-5 h-5 mr-2" />
              {t('categoriesTab')}
            </button>
            <button
              onClick={() => setActiveTab('lottery')}
              className={`flex items-center px-6 py-4 font-medium transition-colors ${
                activeTab === 'lottery'
                  ? 'text-[rgb(48,80,105)] border-b-2 border-[rgb(48,80,105)]'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Ticket className="w-5 h-5 mr-2" />
              {t('lotteryBenefitsTab')}
            </button>
          </div>
        </div>

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'rgb(48,80,105)' }}>
                {t('categoriesTab')}
              </h2>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({ name: '', quotaamount: 0, min_age: 0, max_age: 100 });
                  setShowCategoryModal(true);
                }}
                className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: 'rgb(48,80,105)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(38,70,95)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(48,80,105)'}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('addNewCategory')}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-4 font-medium text-slate-700">{t('categoryName')}</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">{t('annualQuota')}</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">{t('ageRange')}</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category: any) => (
                    <tr key={category.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">{category.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold" style={{ color: 'rgb(48,80,105)' }}>
                          €{category.quotaamount?.toFixed(2) || '0.00'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-600">
                          {category.min_age} - {category.max_age} {t('years')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="p-2 text-slate-600 hover:text-[rgb(48,80,105)] hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lottery Benefits Tab */}
        {activeTab === 'lottery' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'rgb(48,80,105)' }}>
                {t('lotteryBenefitsDescription')}
              </h2>
              <button
                onClick={() => setShowLotteryModal(true)}
                className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: 'rgb(48,80,105)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(38,70,95)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(48,80,105)'}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                {t('editBenefits')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-xl" style={{ backgroundColor: 'rgb(239,246,255)' }}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgb(48,80,105)' }}>
                    <Ticket className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{t('ordinaryLotteries')}</h3>
                    <p className="text-sm text-slate-600">{t('ordinaryLotteriesDesc')}</p>
                  </div>
                </div>
                <div className="text-2xl font-bold" style={{ color: 'rgb(48,80,105)' }}>
                  €{getCurrentBenefits().ordinary_benefit.toFixed(2)}
                </div>
              </div>

              <div className="p-6 rounded-xl" style={{ backgroundColor: 'rgb(239,246,255)' }}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgb(48,80,105)' }}>
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{t('christmasLottery')}</h3>
                    <p className="text-sm text-slate-600">{t('christmasLotteryDesc')}</p>
                  </div>
                </div>
                <div className="text-2xl font-bold" style={{ color: 'rgb(48,80,105)' }}>
                  €{getCurrentBenefits().christmas_benefit.toFixed(2)}
                </div>
              </div>

              <div className="p-6 rounded-xl" style={{ backgroundColor: 'rgb(239,246,255)' }}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgb(48,80,105)' }}>
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{t('childLottery')}</h3>
                    <p className="text-sm text-slate-600">{t('childLotteryDesc')}</p>
                  </div>
                </div>
                <div className="text-2xl font-bold" style={{ color: 'rgb(48,80,105)' }}>
                  €{getCurrentBenefits().child_benefit.toFixed(2)}
                </div>
              </div>

              <div className="p-6 rounded-xl" style={{ backgroundColor: 'rgb(239,246,255)' }}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgb(48,80,105)' }}>
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{t('hortaLottery')}</h3>
                    <p className="text-sm text-slate-600">{t('hortaLotteryDesc')}</p>
                  </div>
                </div>
                <div className="text-2xl font-bold" style={{ color: 'rgb(48,80,105)' }}>
                  €{getCurrentBenefits().horta_benefit.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">
                  {editingCategory ? t('editCategory') : t('addNewCategory')}
                </h3>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('categoryName')}</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="Ej: Adulto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('annualQuotaAmount')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={categoryForm.quotaamount}
                    onChange={(e) => setCategoryForm({ ...categoryForm, quotaamount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('minAge')}</label>
                    <input
                      type="number"
                      value={categoryForm.min_age}
                      onChange={(e) => setCategoryForm({ ...categoryForm, min_age: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('maxAge')}</label>
                    <input
                      type="number"
                      value={categoryForm.max_age}
                      onChange={(e) => setCategoryForm({ ...categoryForm, max_age: parseInt(e.target.value) || 100 })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: 'rgb(48,80,105)' }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lottery Benefits Modal */}
        {showLotteryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">{t('editLotteryBenefits')}</h3>
                <button
                  onClick={() => setShowLotteryModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('ordinaryBenefit')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={lotteryForm.ordinary_benefit}
                    onChange={(e) => setLotteryForm({ ...lotteryForm, ordinary_benefit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="0.40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('christmasBenefit')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={lotteryForm.christmas_benefit}
                    onChange={(e) => setLotteryForm({ ...lotteryForm, christmas_benefit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="5.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('childBenefit')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={lotteryForm.child_benefit}
                    onChange={(e) => setLotteryForm({ ...lotteryForm, child_benefit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="3.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('hortaBenefit')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={lotteryForm.horta_benefit}
                    onChange={(e) => setLotteryForm({ ...lotteryForm, horta_benefit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="2.50"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  onClick={() => setShowLotteryModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveLotteryBenefits}
                  className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: 'rgb(48,80,105)' }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

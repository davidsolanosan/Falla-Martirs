import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useSupabase } from '../../lib/SupabaseContext';
import { Package, Plus, Edit2, Trash2, Eye, X, Check, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';

export default function PeticionesAdmin() {
  const { t } = useTranslation();
  const { petitionArticles, petitions, createPetitionArticle, updatePetitionArticle, deletePetitionArticle, updatePetition } = useSupabase();
  
  const [activeTab, setActiveTab] = useState<'articles' | 'petitions'>('articles');
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [selectedPetition, setSelectedPetition] = useState(null);
  const [showPetitionDetails, setShowPetitionDetails] = useState(false);
  
  // Form state
  const [articleForm, setArticleForm] = useState({
    name: '',
    section: 'Ropa',
    category: 'Adulto',
    gender: 'Unisex',
    sizes: ['M'],
    price: 0,
    image_url: '',
    description: '',
    available: true
  });

  const ADULT_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
  const CHILD_SIZES = ['2-3 años', '4-5 años', '6-7 años', '8-9 años', '10-12 años'];
  const UNIQUE_SIZE = ['Única'];

  const getAvailableSizes = () => {
    if (articleForm.category === 'Adulto') return ADULT_SIZES;
    if (articleForm.category === 'Infantil') return CHILD_SIZES;
    if (articleForm.section === 'Insignias' || articleForm.section === 'Bandas') return UNIQUE_SIZE;
    return ADULT_SIZES;
  };

  const resetArticleForm = () => {
    setArticleForm({
      name: '',
      section: 'Ropa',
      category: 'Adulto',
      gender: 'Unisex',
      sizes: ['M'],
      price: 0,
      image_url: '',
      description: '',
      available: true
    });
    setEditingArticle(null);
  };

  const handleSaveArticle = async () => {
    try {
      if (editingArticle) {
        await updatePetitionArticle(editingArticle.id, articleForm);
      } else {
        await createPetitionArticle(articleForm);
      }
      setShowArticleForm(false);
      resetArticleForm();
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Error al guardar el artículo');
    }
  };

  const handleEditArticle = (article) => {
    setEditingArticle(article);
    setArticleForm({
      name: article.name,
      section: article.section,
      category: article.category,
      gender: article.gender,
      sizes: article.sizes,
      price: article.price,
      image_url: article.image_url || '',
      description: article.description || '',
      available: article.available
    });
    setShowArticleForm(true);
  };

  const handleDeleteArticle = async (id) => {
    if (confirm('¿Estás seguro de que quieres eliminar este artículo?')) {
      try {
        await deletePetitionArticle(id);
      } catch (error) {
        console.error('Error deleting article:', error);
        alert('Error al eliminar el artículo');
      }
    }
  };

  const handleCancelPetition = async (petitionId, reason) => {
    try {
      await updatePetition(petitionId, {
        status: 'cancelled',
        cancellation_reason: reason
      });
      setShowPetitionDetails(false);
      setSelectedPetition(null);
    } catch (error) {
      console.error('Error cancelling petition:', error);
      alert('Error al cancelar la petición');
    }
  };

  const handleDeliverPetition = async (petitionId) => {
    try {
      await updatePetition(petitionId, {
        status: 'delivered'
      });
      setShowPetitionDetails(false);
      setSelectedPetition(null);
    } catch (error) {
      console.error('Error delivering petition:', error);
      alert('Error al marcar como entregado');
    }
  };

  const sections = [...new Set(petitionArticles?.map(a => a.section) || [])];
  const pendingPetitions = petitions?.filter(p => p.status === 'pending') || [];
  const deliveredPetitions = petitions?.filter(p => p.status === 'delivered') || [];
  const cancelledPetitions = petitions?.filter(p => p.status === 'cancelled') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {t('petitionsManagement') || 'Gestión de Peticiones'}
                </h1>
                <p className="text-slate-600">
                  {t('petitionsManagementDescription') || 'Gestiona artículos y solicitudes de la falla'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                resetArticleForm();
                setShowArticleForm(true);
              }}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t('newArticle') || 'Nuevo Artículo'}</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-8">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('articles')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'articles'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {t('articles') || 'Artículos'} ({petitionArticles?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('petitions')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'petitions'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {t('petitions') || 'Peticiones'} ({petitions?.length || 0})
            </button>
          </div>

          {/* Articles Tab */}
          {activeTab === 'articles' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {petitionArticles?.map((article) => (
                  <div key={article.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">{article.name}</h3>
                        <p className="text-sm text-slate-600">{article.section} - {article.category}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        article.available 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {article.available ? (t('available') || 'Disponible') : (t('notAvailable') || 'No disponible')}
                      </div>
                    </div>
                    
                    {article.image_url && (
                      <div className="mb-3">
                        <img 
                          src={article.image_url} 
                          alt={article.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">{t('gender') || 'Género'}:</span>
                        <span className="font-medium">{article.gender}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">{t('sizes') || 'Tallas'}:</span>
                        <span className="font-medium">{article.sizes.join(', ')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">{t('price') || 'Precio'}:</span>
                        <span className="font-medium text-green-600">€{article.price.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {article.description && (
                      <p className="text-sm text-slate-600 mb-4">{article.description}</p>
                    )}
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditArticle(article)}
                        className="flex-1 flex items-center justify-center space-x-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span className="text-sm">{t('edit') || 'Editar'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
                        className="flex-1 flex items-center justify-center space-x-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm">{t('delete') || 'Eliminar'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Petitions Tab */}
          {activeTab === 'petitions' && (
            <div className="p-6">
              <div className="space-y-6">
                {/* Pending Petitions */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    {t('pendingPetitions') || 'Peticiones Pendientes'} ({pendingPetitions.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingPetitions.map((petition) => (
                      <div key={petition.id} className="bg-white border border-slate-200 rounded-xl p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                {t('pending') || 'Pendiente'}
                              </span>
                              <span className="text-sm text-slate-500">
                                {new Date(petition.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="font-medium text-slate-800 mb-1">
                              {petition.items.length} {t('items') || 'artículos'}
                            </p>
                            <p className="text-sm text-slate-600 mb-2">
                              {t('total') || 'Total'}: €{petition.total_amount.toFixed(2)}
                            </p>
                            {petition.notes && (
                              <p className="text-sm text-slate-600 italic">{petition.notes}</p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedPetition(petition);
                                setShowPetitionDetails(true);
                              }}
                              className="flex items-center space-x-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="text-sm">{t('view') || 'Ver'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivered Petitions */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    {t('deliveredPetitions') || 'Peticiones Entregadas'} ({deliveredPetitions.length})
                  </h3>
                  <div className="space-y-3">
                    {deliveredPetitions.map((petition) => (
                      <div key={petition.id} className="bg-white border border-slate-200 rounded-xl p-4 opacity-75">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                {t('delivered') || 'Entregado'}
                              </span>
                              <span className="text-sm text-slate-500">
                                {new Date(petition.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="font-medium text-slate-800 mb-1">
                              {petition.items.length} {t('items') || 'artículos'}
                            </p>
                            <p className="text-sm text-slate-600">
                              {t('total') || 'Total'}: €{petition.total_amount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Article Form Modal */}
        {showArticleForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">
                  {editingArticle ? (t('editArticle') || 'Editar Artículo') : (t('newArticle') || 'Nuevo Artículo')}
                </h3>
                <button
                  onClick={() => {
                    setShowArticleForm(false);
                    resetArticleForm();
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('name') || 'Nombre'} *
                    </label>
                    <input
                      type="text"
                      value={articleForm.name}
                      onChange={(e) => setArticleForm({...articleForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('section') || 'Sección'} *
                    </label>
                    <input
                      type="text"
                      value={articleForm.section}
                      onChange={(e) => setArticleForm({...articleForm, section: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      placeholder="Ropa, Insignias, Bandas..."
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('category') || 'Categoría'} *
                    </label>
                    <select
                      value={articleForm.category}
                      onChange={(e) => setArticleForm({...articleForm, category: e.target.value, sizes: []})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      <option value="Adulto">{t('adult') || 'Adulto'}</option>
                      <option value="Infantil">{t('child') || 'Infantil'}</option>
                      <option value="Niño">{t('kid') || 'Niño'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('gender') || 'Género'} *
                    </label>
                    <select
                      value={articleForm.gender}
                      onChange={(e) => setArticleForm({...articleForm, gender: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      <option value="Hombre">{t('male') || 'Hombre'}</option>
                      <option value="Mujer">{t('female') || 'Mujer'}</option>
                      <option value="Unisex">{t('unisex') || 'Unisex'}</option>
                      <option value="Niño">{t('kid') || 'Niño'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('price') || 'Precio'} (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={articleForm.price}
                      onChange={(e) => setArticleForm({...articleForm, price: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('sizes') || 'Tallas'} *
                  </label>
                  <div className="space-y-2">
                    {getAvailableSizes().map((size) => (
                      <label key={size} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={articleForm.sizes.includes(size)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setArticleForm({...articleForm, sizes: [...articleForm.sizes, size]});
                            } else {
                              setArticleForm({...articleForm, sizes: articleForm.sizes.filter(s => s !== size)});
                            }
                          }}
                          className="rounded border-slate-300"
                        />
                        <span className="text-sm">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('imageUrl') || 'URL de Imagen'}
                  </label>
                  <input
                    type="url"
                    value={articleForm.image_url}
                    onChange={(e) => setArticleForm({...articleForm, image_url: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('description') || 'Descripción'}
                  </label>
                  <textarea
                    value={articleForm.description}
                    onChange={(e) => setArticleForm({...articleForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={articleForm.available}
                    onChange={(e) => setArticleForm({...articleForm, available: e.target.checked})}
                    className="rounded border-slate-300"
                  />
                  <label className="text-sm font-medium text-slate-700">
                    {t('available') || 'Disponible'}
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowArticleForm(false);
                    resetArticleForm();
                  }}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  {t('cancel') || 'Cancelar'}
                </button>
                <button
                  onClick={handleSaveArticle}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingArticle ? (t('update') || 'Actualizar') : (t('create') || 'Crear')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Petition Details Modal */}
        {showPetitionDetails && selectedPetition && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">
                  {t('petitionDetails') || 'Detalles de Petición'}
                </h3>
                <button
                  onClick={() => {
                    setShowPetitionDetails(false);
                    setSelectedPetition(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-medium text-slate-800 mb-2">{t('requestedItems') || 'Artículos Solicitados'}</h4>
                  <div className="space-y-2">
                    {selectedPetition.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-white rounded-lg p-3">
                        <div>
                          <p className="font-medium text-slate-800">{item.article_name}</p>
                          <p className="text-sm text-slate-600">{item.size} x {item.quantity}</p>
                        </div>
                        <p className="font-medium text-green-600">€{item.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 mt-3 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800">{t('total') || 'Total'}:</span>
                      <span className="font-bold text-green-600 text-lg">€{selectedPetition.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {selectedPetition.notes && (
                  <div>
                    <h4 className="font-medium text-slate-800 mb-2">{t('notes') || 'Notas'}</h4>
                    <p className="text-slate-600 bg-slate-50 rounded-lg p-3">{selectedPetition.notes}</p>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm text-slate-600">
                  <span>{t('requestDate') || 'Fecha de solicitud'}: {new Date(selectedPetition.created_at).toLocaleDateString()}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedPetition.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-700'
                      : selectedPetition.status === 'delivered'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedPetition.status === 'pending' ? (t('pending') || 'Pendiente') : 
                     selectedPetition.status === 'delivered' ? (t('delivered') || 'Entregado') : 
                     (t('cancelled') || 'Cancelado')}
                  </span>
                </div>

                {selectedPetition.status === 'pending' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleDeliverPetition(selectedPetition.id)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>{t('markAsDelivered') || 'Marcar como Entregado'}</span>
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt(t('cancellationReason') || 'Motivo de cancelación:');
                        if (reason) {
                          handleCancelPetition(selectedPetition.id, reason);
                        }
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>{t('cancelPetition') || 'Cancelar Petición'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../lib/i18n';
import { useSupabase } from '../lib/SupabaseContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Plus, Minus, X, Search, Filter, User, History, Image as ImageIcon, Shirt, Award, Users, Package as PackageIcon } from 'lucide-react';

export default function Peticiones() {
  const { t } = useTranslation();
  const { user, families } = useAuth();
  const { petitionArticles, petitionCategories, petitions, createPetition } = useSupabase();
  
  const [activeTab, setActiveTab] = useState<'catalog' | 'history'>('catalog');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedSection, setSelectedSection] = useState('Todas');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  
  // Get user's family
  const userFamily = families?.find(f => f.id === user?.family_id);

  // Function to get icon component
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'Shirt': Shirt,
      'Award': Award,
      'Users': Users,
      'Package': PackageIcon,
    };
    return iconMap[iconName] || Package;
  };

  // Function to get color classes
  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string, text: string, hover: string } } = {
      'blue': { bg: 'bg-blue-100', text: 'text-blue-600', hover: 'hover:bg-blue-200' },
      'yellow': { bg: 'bg-yellow-100', text: 'text-yellow-600', hover: 'hover:bg-yellow-200' },
      'green': { bg: 'bg-green-100', text: 'text-green-600', hover: 'hover:bg-green-200' },
      'purple': { bg: 'bg-purple-100', text: 'text-purple-600', hover: 'hover:bg-purple-200' },
    };
    return colorMap[color] || colorMap['blue'];
  };

  // Filter articles
  const filteredArticles = petitionArticles?.filter(article => {
    if (!article.available) return false;
    if (selectedSection !== 'Todas' && article.section !== selectedSection) return false;
    if (selectedCategory && selectedCategory !== 'Todas') {
      // Filtrar por categoría usando petition_categories
      const category = petitionCategories?.find(c => c.name === article.category);
      if (!category || category.id !== selectedCategory) return false;
    }
    if (selectedGender !== 'Todas' && !article.genders?.includes(selectedGender)) return false;
    if (searchTerm && !article.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  }) || [];

  const sections = ['Todas', ...[...new Set(petitionArticles?.map(a => a.section) || [])]];
  const categories = petitionCategories || [];
  const genders = ['Todas', ...[...new Set(petitionArticles?.flatMap(a => a.genders || []) || [])]];

  const userPetitions = petitions?.filter(p => p.user_id === user?.id) || [];

  // Función para traducir tallas (bilingüe)
  const getTranslatedSize = (size) => {
    const sizeTranslations = {
      '2-3 años': t('size_2_3_years') || '2-3 años',
      '4-5 años': t('size_4_5_years') || '4-5 años',
      '6-7 años': t('size_6_7_years') || '6-7 años',
      '8-9 años': t('size_8_9_years') || '8-9 años',
      '10-12 años': t('size_10_12_years') || '10-12 años',
      'Única': t('size_unique') || 'Única'
    };
    return sizeTranslations[size] || size;
  };

  const addToCart = (article, size, quantity = 1) => {
    // Confirmación antes de añadir al carrito
    const translatedSize = getTranslatedSize(size);
    const confirmMessage = `${t('confirmAddToCart') || '¿Añadir'} ${article.name} (${translatedSize}) ${t('toCart') || 'al carrito'}?`;
    console.log('Confirm message:', confirmMessage); // Debug
    
    if (window.confirm(confirmMessage)) {
      const existingItem = cart.find(item => 
        item.article_id === article.id && item.size === size
      );
      
      if (existingItem) {
        setCart(cart.map(item => 
          item.article_id === article.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ));
      } else {
        setCart([...cart, {
          article_id: article.id,
          article_name: article.name,
          size,
          quantity,
          price: article.price
        }]);
      }
    }
  };

  const removeFromCart = (articleId, size) => {
    setCart(cart.filter(item => !(item.article_id === articleId && item.size === size)));
  };

  const updateQuantity = (articleId, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(articleId, size);
    } else {
      setCart(cart.map(item => 
        item.article_id === articleId && item.size === size
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (!user || !userFamily) {
      alert('Debes estar registrado y tener una familia asignada');
      return;
    }

    try {
      await createPetition({
        user_id: user.id,
        family_id: userFamily.id,
        items: cart,
        total_amount: getTotalAmount(),
        status: 'pending',
        notes: orderNotes
      });

      // Clear cart and close modal
      setCart([]);
      setShowCheckoutModal(false);
      setOrderNotes('');
      setShowCart(false);
      
      alert('¡Petición realizada con éxito! Se ha añadido el importe a tus cuotas de este mes.');
    } catch (error) {
      console.error('Error creating petition:', error);
      alert('Error al realizar la petición');
    }
  };

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
                  {t('petitions') || 'Peticiones'}
                </h1>
                <p className="text-slate-600">
                  {t('petitionsDescription') || 'Solicita artículos de la falla'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{t('cart') || 'Carrito'}</span>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-8">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'catalog'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {t('catalog') || 'Catálogo'}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {t('myPetitions') || 'Mis Peticiones'} ({userPetitions.length})
            </button>
          </div>

          {/* Catalog Tab */}
          {activeTab === 'catalog' && (
            <div className="p-6">
              {/* Categories Grid - First View */}
              {!selectedCategory && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4">
                    {t('selectCategory') || 'Selecciona una categoría'}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* All Categories Option */}
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        !selectedCategory
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <div className="p-3 bg-slate-100 rounded-lg">
                          <Package className="w-8 h-8 text-slate-600" />
                        </div>
                        <div className="text-center">
                          <h3 className="font-semibold text-slate-800">
                            {t('allCategories') || 'Todas las categorías'}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {petitionArticles?.length || 0} {t('items') || 'artículos'}
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Individual Categories */}
                    {categories.map((category) => {
                      const IconComponent = getIconComponent(category.icon);
                      const colors = getColorClasses(category.color);
                      const articleCount = petitionArticles?.filter(a => a.category_id === category.id).length || 0;
                      
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`p-6 rounded-xl border-2 transition-all ${
                            selectedCategory === category.id
                              ? 'border-blue-500 bg-blue-50 shadow-lg'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-3">
                            <div className={`p-3 ${colors.bg} rounded-lg`}>
                              <IconComponent className={`w-8 h-8 ${colors.text}`} />
                            </div>
                            <div className="text-center">
                              <h3 className="font-semibold text-slate-800">{category.name}</h3>
                              <p className="text-sm text-slate-600">
                                {articleCount} {t('items') || 'artículos'}
                              </p>
                              {category.description && (
                                <p className="text-xs text-slate-500 mt-1">{category.description}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Filters - Show only when category is selected */}
              {selectedCategory && (
                <div className="mb-6 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                    >
                      <X className="w-4 h-4" />
                      <span>{t('backToCategories') || 'Volver a categorías'}</span>
                    </button>
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const category = petitionCategories?.find(c => c.id === selectedCategory);
                        const IconComponent = category ? getIconComponent(category.icon) : Package;
                        const colors = category ? getColorClasses(category.color) : getColorClasses('blue');
                        return (
                          <>
                            <div className={`p-2 ${colors.bg} rounded-lg`}>
                              <IconComponent className={`w-5 h-5 ${colors.text}`} />
                            </div>
                            <span className="font-semibold text-slate-800">
                              {category?.name || t('allCategories') || 'Todas las categorías'}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder={t('searchArticles') || 'Buscar artículos...'}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={selectedGender}
                        onChange={(e) => setSelectedGender(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-lg"
                      >
                        {genders.map(gender => (
                          <option key={gender} value={gender}>{gender}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Articles Grid - Show only when category is selected */}
              {selectedCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredArticles.map((article) => (
                    <div key={article.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    {article.image_url ? (
                      <div className="h-48 bg-slate-100">
                        <img 
                          src={article.image_url} 
                          alt={article.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-slate-100 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-slate-400" />
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="mb-2">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {article.section}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-slate-800 mb-2">{article.name}</h3>
                      
                      <div className="space-y-1 text-sm text-slate-600 mb-3">
                        <p>{article.category} • {article.gender}</p>
                        <p>{t('sizes') || 'Tallas'}: {article.sizes.map(size => getTranslatedSize(size)).join(', ')}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-green-600">€{article.price.toFixed(2)}</span>
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          {t('available') || 'Disponible'}
                        </span>
                      </div>
                      
                      {article.description && (
                        <p className="text-sm text-slate-600 mb-3">{article.description}</p>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          {article.sizes.map((size) => (
                            <button
                              key={size}
                              onClick={() => addToCart(article, size)}
                              className="flex-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                            >
                              {getTranslatedSize(size)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              )}

              {selectedCategory && filteredArticles.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">{t('noArticlesFound') || 'No se encontraron artículos'}</p>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="p-6">
              <div className="space-y-4">
                {userPetitions.map((petition) => (
                  <div key={petition.id} className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          petition.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-700'
                            : petition.status === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {petition.status === 'pending' ? (t('pending') || 'Pendiente') : 
                           petition.status === 'delivered' ? (t('delivered') || 'Entregado') : 
                           (t('cancelled') || 'Cancelado')}
                        </span>
                        <span className="text-sm text-slate-500">
                          {new Date(petition.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="font-bold text-green-600">€{petition.total_amount.toFixed(2)}</span>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      {petition.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-slate-700">{item.article_name} ({getTranslatedSize(item.size)}) x {item.quantity}</span>
                          <span className="text-slate-600">€{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    {petition.notes && (
                      <p className="text-sm text-slate-600 italic bg-slate-50 rounded p-2">
                        {t('notes') || 'Notas'}: {petition.notes}
                      </p>
                    )}
                    
                    {petition.cancellation_reason && (
                      <p className="text-sm text-red-600 bg-red-50 rounded p-2">
                        {t('cancellationReason') || 'Motivo de cancelación'}: {petition.cancellation_reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {userPetitions.length === 0 && (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">{t('noPetitionsYet') || 'Aún no has realizado peticiones'}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 z-50 flex">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShowCart(false)}
            />
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800">
                    {t('cart') || 'Carrito'} ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                  </h3>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">{t('emptyCart') || 'Carrito vacío'}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={`${item.article_id}-${item.size}`} className="bg-slate-50 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-slate-800">{item.article_name}</h4>
                              <p className="text-sm text-slate-600">{getTranslatedSize(item.size)}</p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.article_id, item.size)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateQuantity(item.article_id, item.size, item.quantity - 1)}
                                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.article_id, item.size, item.quantity + 1)}
                                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="font-medium text-green-600">€{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {cart.length > 0 && (
                  <div className="border-t border-slate-200 p-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-slate-800">{t('total') || 'Total'}:</span>
                      <span className="text-lg font-bold text-green-600">€{getTotalAmount().toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => setShowCheckoutModal(true)}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t('checkout') || 'Realizar Petición'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Checkout Modal */}
        {showCheckoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">
                  {t('confirmPetition') || 'Confirmar Petición'}
                </h3>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-medium text-slate-800 mb-2">{t('orderSummary') || 'Resumen del Pedido'}</h4>
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={`${item.article_id}-${item.size}`} className="flex justify-between text-sm">
                        <span>{item.article_name} ({item.size}) x {item.quantity}</span>
                        <span>€{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 mt-3 pt-3">
                    <div className="flex justify-between font-semibold">
                      <span>{t('total') || 'Total'}:</span>
                      <span className="text-green-600">€{getTotalAmount().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('notes') || 'Notas'} ({t('optional') || 'opcional'})
                  </label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    rows={3}
                    placeholder={t('orderNotesPlaceholder') || 'Añade notas especiales para tu pedido...'}
                  />
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>{t('important') || 'Importante'}:</strong> {t('paymentInfo') || 'El importe se añadirá automáticamente a tus cuotas de este mes.'}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 px-4 py-2 text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg"
                >
                  {t('cancel') || 'Cancelar'}
                </button>
                <button
                  onClick={handleCheckout}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('confirmPetition') || 'Confirmar Petición'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

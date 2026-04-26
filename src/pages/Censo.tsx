import React, { useState, useMemo } from 'react';
import { useTranslation } from '../lib/i18n';
import { useSupabase } from '../lib/SupabaseContext';
import { useAuth } from '../context/AuthContext';
import { UserFormModal } from '../components/forms/UserFormModal';
import { FamilyFormModal } from '../components/forms/FamilyFormModal';
import { FamilyQuotaModal } from '../components/forms/FamilyQuotaModal';
import { ImportCensusModal } from '../components/admin/ImportCensusModal';
import { RoleManagement } from '../components/admin/RoleManagement';
import { MasterAdminInit } from '../components/admin/MasterAdminInit';
import FamilyManagementModal from '../components/forms/FamilyManagementModal';
import { Search, Plus, Users, FileText, Calendar, Home, Settings, Download, Upload, Edit, UserCircle, Calculator, RefreshCcw, Trash } from 'lucide-react';

export default function Censo() {
  const { families, categories, users, updateFamily, deleteFamily, familyRepresentatives, setRepresentatives } = useSupabase(); // Datos de Supabase
  const { user } = useAuth(); // Usuario de AuthContext
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'usuarios' | 'familias'>('usuarios');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isFamilyManagementOpen, setIsFamilyManagementOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [familyToManage, setFamilyToManage] = useState<any>(null);
  const [userToEdit, setUserToEdit] = useState<any>(null);
  const [familyToEdit, setFamilyToEdit] = useState<any>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{type: 'user' | 'family', id: string, name: string} | null>(null);

  const isAdmin = user ? (user.role === 'admin' || user.role === 'master_admin') : false;

  const getAutoCategory = (birthYear: string, categories: Category[]) => {
    if (!birthYear || !categories.length) return null;
    
    let year: number;
    
    // Detectar formato y extraer el año
    if (birthYear.includes('/')) {
      // Formato dd/mm/aaaa, extraer el año
      const parts = birthYear.split('/');
      year = parseInt(parts[parts.length - 1]); // Tomar el último elemento como año
    } else if (birthYear.includes('-')) {
      // Formato dd-mm-aaaa o similar, extraer el año
      const parts = birthYear.split('-');
      year = parseInt(parts[parts.length - 1]); // Tomar el último elemento como año
    } else {
      // Formato aaaa directo
      year = parseInt(birthYear);
    }
    
    // Validar que el año sea válido
    if (isNaN(year) || year < 1900 || year > 2025) return null;
    
    const currentYear = new Date().getFullYear();
    
    // Considerar el 20 de marzo como fecha de referencia
    const referenceDate = new Date(currentYear, 2, 20); // 20 de marzo del año actual
    const userBirthDate = new Date(year, 2, 20); // 20 de marzo del año de nacimiento
    const referenceAge = currentYear - year;
    
    // Si el cumpleaños es antes del 20 de marzo, ya cumplió años este año
    const hasHadBirthdayThisYear = userBirthDate <= referenceDate;
    const actualAge = hasHadBirthdayThisYear ? referenceAge : referenceAge - 1;
    
    // Buscar la categoría que corresponde a la edad
    const matchingCategory = categories.find(cat => {
      if (cat.min_age !== undefined && actualAge < cat.min_age) return false;
      if (cat.max_age !== undefined && actualAge > cat.max_age) return false;
      return true;
    });
    
    if (matchingCategory) {
      // Asignar colores suaves específicos según el nombre de la categoría
      const categoryName = matchingCategory.name.toLowerCase();
      let bgColor = 'bg-slate-50';
      
      if (categoryName.includes('infantil') || categoryName.includes('bebé') || categoryName.includes('bebe')) {
        bgColor = 'bg-pink-50';
      } else if (categoryName.includes('juvenil')) {
        bgColor = 'bg-blue-50';
      } else if (categoryName.includes('adulto')) {
        bgColor = 'bg-green-50';
      } else if (categoryName.includes('senior') || categoryName.includes('jubilado')) {
        bgColor = 'bg-purple-50';
      }
      
      return {
        name: matchingCategory.name,
        id: matchingCategory.id,
        color: bgColor
      };
    }
    
    return null;
  };

  const getRowStyle = (category: any) => {
    if (!category) return '';
    return category.color || '';
  };

  const formatUserName = (user: any) => {
    return `${user.name || ''} ${user.surname || ''}`.trim();
  };

  const handleEditUser = (user: any) => {
    setUserToEdit(user);
    setIsUserModalOpen(true);
  };

  const handleOpenFamilyModal = (user: any) => {
    setFamilyToEdit(families.find(f => f.id === user.family_id));
    setIsFamilyModalOpen(true);
  };

  const handleDeleteUser = (user: any) => {
    setDeleteConfirm({
      type: 'user',
      id: user.id,
      name: `${user.name} ${user.surname || ''}`
    });
  };

  const handleDeleteFamily = (family: any) => {
    setDeleteConfirm({
      type: 'family',
      id: family.id,
      name: family.name
    });
  };

  const handleUpdateFamily = async (familyId: string, updates: any) => {
    try {
      console.log('🔄 handleUpdateFamily called with:', { familyId, updates });
      await updateFamily(familyId, updates);
      console.log('✅ Familia actualizada correctamente');
      
      // Actualizar el estado local con los datos enviados
      if (familyToManage && familyToManage.id === familyId) {
        setFamilyToManage(prev => ({
          ...prev,
          ...updates
        }));
        console.log('✅ familyToManage actualizado localmente');
      }
    } catch (error) {
      console.error('❌ Error updating family:', error);
      throw error;
    }
  };

  const handleDeleteFamilyModal = async (familyId: string) => {
    try {
      await deleteFamily(familyId);
      console.log('Familia eliminada correctamente');
    } catch (error) {
      console.error('Error deleting family:', error);
      throw error;
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      if (deleteConfirm.type === 'user') {
        // Aquí iría la lógica de eliminación de usuario
        console.log('Eliminando usuario:', deleteConfirm.id);
      } else if (deleteConfirm.type === 'family') {
        // Aquí iría la lógica de eliminación de familia
        console.log('Eliminando familia:', deleteConfirm.id);
      }
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar. Revisa la consola para más detalles.');
    }
  };

  const handleEditFamily = (family: any) => {
    setFamilyToEdit(family);
    setIsFamilyModalOpen(true);
  };

  const handleManageFamily = (family: any) => {
    setFamilyToManage(family);
    setIsFamilyManagementOpen(true);
  };

  const toggleCategoryFilter = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearCategoryFilters = () => {
    setSelectedCategories([]);
  };

  const userCategories = useMemo(() => {
    return users.map(user => {
      const autoCategory = user.birth_year ? getAutoCategory(user.birth_year, categories) : null;
      return {
        ...user,
        category: null, // Mantener categoría manual como null
        autoCategory: autoCategory,
        displayCategory: autoCategory // Usar categoría automática para visualización
      };
    });
  }, [users, categories]);

  const filteredUsers = useMemo(() => {
    if (!user) return [];
    
    let baseUsers = isAdmin 
      ? userCategories.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.surname?.toLowerCase().includes(searchTerm.toLowerCase()))
      : userCategories.filter(u => u.family_id === user.family_id);
    
    // Aplicar búsqueda por término si no es admin (para usuarios normales también buscar)
    if (!isAdmin && searchTerm) {
      baseUsers = baseUsers.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.surname?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por categorías seleccionadas
    if (selectedCategories.length > 0) {
      baseUsers = baseUsers.filter(u => 
        u.displayCategory && selectedCategories.includes(u.displayCategory.id)
      );
    }
    
    const sortedUsers = baseUsers.sort((a, b) => {
      const surnameA = a.surname || '';
      const surnameB = b.surname || '';
      return surnameA.localeCompare(surnameB);
    });
    
    return sortedUsers;
  }, [userCategories, searchTerm, isAdmin, user, selectedCategories]);
  
  // Contar falleros por categoría
  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    userCategories.forEach(u => {
      if (u.displayCategory) {
        counts[u.displayCategory.id] = (counts[u.displayCategory.id] || 0) + 1;
      }
    });
    return counts;
  }, [userCategories]);
    
  const filteredFamilies = isAdmin
    ? families.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : user ? families.filter(f => f.id === user.family_id) : [];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{isAdmin ? t('navCensus') : t('navMyFamily')}</h2>
          
          {/* Botones de acción */}
          <div className="flex flex-wrap gap-2">
            {isAdmin && (
              <>
                <button
                  onClick={() => setIsUserModalOpen(true)}
                  className="inline-flex items-center px-3 py-1.5 bg-white text-[rgb(48,80,105)] border-3 border-[rgb(48,80,105)] rounded-xl hover:bg-[rgb(48,80,105)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[rgb(48,80,105)] focus:ring-offset-2 transition-all text-sm font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('addFallero')}
                </button>
                <button
                  onClick={() => setIsFamilyModalOpen(true)}
                  className="inline-flex items-center px-3 py-1.5 bg-white text-[rgb(48,80,105)] border-3 border-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)] hover:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(48,80,105)] focus:ring-offset-2 transition-all text-sm font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('addFamily')}
                </button>
                                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="inline-flex items-center px-3 py-1.5 bg-white text-[rgb(48,80,105)] border-3 border-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)] hover:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(48,80,105)] focus:ring-offset-2 transition-all text-sm font-medium"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Imp. Cens
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tabs, filtros y buscador en la misma línea */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-4">
          {/* Tabs */}
          <div className="border-b border-slate-200 lg:border-b-0 flex-shrink-0">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('usuarios')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'usuarios'
                    ? 'border-slate-800 text-slate-800'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Users className="h-5 w-5 mr-2" />
                {t('falleros')}
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('familias')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'familias'
                      ? 'border-slate-800 text-slate-800'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Home className="h-5 w-5 mr-2" />
                  {t('families')}
                </button>
              )}
            </nav>
          </div>

          {/* Espacio flexible para empujar filtros y buscador a la derecha */}
          <div className="flex-1"></div>

          {/* Filtros y buscador juntos a la derecha */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Filtros por categorías */}
            <div className="flex items-center">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-600 mr-2">Filtrar:</span>
                {categories.map(cat => {
                  const count = categoryCounts[cat.id] || 0;
                  const isSelected = selectedCategories.includes(cat.id);
                  const categoryName = cat.name.toLowerCase();
                  
                  // Asignar colores a los botones según categoría
                let buttonColor = 'bg-white text-[rgb(48,80,105)] border-3 border-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)] hover:text-white';
                let selectedColor = 'bg-[rgb(48,80,105)] text-white border-3 border-[rgb(48,80,105)] hover:bg-white hover:text-[rgb(48,80,105)]';
                
                if (categoryName.includes('infantil') || categoryName.includes('bebé') || categoryName.includes('bebe')) {
                  buttonColor = 'bg-white text-[rgb(48,80,105)] border-3 border-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)] hover:text-white';
                  selectedColor = 'bg-[rgb(48,80,105)] text-white border-3 border-[rgb(48,80,105)] hover:bg-white hover:text-[rgb(48,80,105)]';
                } else if (categoryName.includes('juvenil')) {
                  buttonColor = 'bg-white text-[rgb(48,80,105)] border-3 border-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)] hover:text-white';
                  selectedColor = 'bg-[rgb(48,80,105)] text-white border-3 border-[rgb(48,80,105)] hover:bg-white hover:text-[rgb(48,80,105)]';
                } else if (categoryName.includes('adulto')) {
                  buttonColor = 'bg-white text-[rgb(48,80,105)] border-3 border-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)] hover:text-white';
                  selectedColor = 'bg-[rgb(48,80,105)] text-white border-3 border-[rgb(48,80,105)] hover:bg-white hover:text-[rgb(48,80,105)]';
                } else if (categoryName.includes('senior') || categoryName.includes('jubilado')) {
                  buttonColor = 'bg-white text-[rgb(48,80,105)] border-3 border-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)] hover:text-white';
                  selectedColor = 'bg-[rgb(48,80,105)] text-white border-3 border-[rgb(48,80,105)] hover:bg-white hover:text-[rgb(48,80,105)]';
                }
                
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategoryFilter(cat.id)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${isSelected ? selectedColor : buttonColor} ${count === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={count === 0}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
                {selectedCategories.length > 0 && (
                  <button
                    onClick={clearCategoryFilters}
                    className="ml-2 text-xs text-slate-500 hover:text-slate-700 transition-colors underline"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Buscador */}
            <div className="w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 text-slate-400 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('searchUsers')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg focus:ring-slate-500 focus:border-slate-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* List - ocupa el espacio restante */}
      <div className="flex-1 overflow-hidden bg-white rounded-3xl shadow-sm border border-slate-200 m-4 mt-0 min-h-0">
        {activeTab === 'usuarios' || !isAdmin ? (
          <div className="h-[calc(100vh-280px)] overflow-auto">
            <div style={{width: '1600px'}}>
              <table className="w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 sticky top-0 z-20">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">{t('colNumCenso')}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">{t('colCodJCF')}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">{t('colSurnames')}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">{t('colName')}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">{t('colCategory')}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">{t('colDNI')}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">{t('colPhone')}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">{t('colAddress')}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">{t('colCity')}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">{t('colCP')}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">{t('colBirth')}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">{t('colSex')}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">{t('colEmail')}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">{t('colCarrec')}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">{t('colRole')}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">{t('colReward')}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">{t('colFamily')}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">{t('colTutor')}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">{t('colTutorPhone')}</th>
                    {isAdmin && <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">{t('colActions')}</th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredUsers.map(user => {
                    const family = families.find(f => f.id === user.family_id);
                    return (
                      <tr 
                        key={user.id} 
                        className={`hover:bg-slate-100 transition-colors cursor-pointer ${user.displayCategory?.color || ''}`}
                        onClick={() => handleEditUser(user)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.numero_censo || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.codigo_jcf || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.surname || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.name || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.displayCategory?.name || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.dni || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.phone || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.address || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.poblacion || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.codigo_postal || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.birth_year || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.sexo || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.correu || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.cargo || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.role || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.recompensa || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{family?.name || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.tutor || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.telefon_tutor || '-'}</td>
                        {isAdmin && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditUser(user);
                                }}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteUser(user);
                                }}
                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                title="Eliminar"
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
            </table>
          </div>
        </div>
        ) : (
          <div className="h-full overflow-auto p-4 space-y-4 max-h-[calc(100vh-280px)]">
            {filteredFamilies.map(family => (
              <div key={family.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-slate-900">{family.name}</h3>
                    <p className="text-sm text-slate-500">
                      {family.address || ''}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleManageFamily(family)}
                      className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                      title="Gestionar familia"
                    >
                      <Users className="h-4 w-4" />
                    </button>
                                        <button
                      onClick={() => handleDeleteFamily(family)}
                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                      title="Eliminar familia"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {users.filter(u => u.family_id === family.id).length} {t('members')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <UserFormModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} userToEdit={userToEdit} />
      <FamilyFormModal isOpen={isFamilyModalOpen} onClose={() => setIsFamilyModalOpen(false)} familyToEdit={familyToEdit} />
      <FamilyManagementModal 
        isOpen={isFamilyManagementOpen} 
        onClose={() => setIsFamilyManagementOpen(false)} 
        family={familyToManage} 
        users={users} 
        familyRepresentatives={familyRepresentatives}
        onUpdate={handleUpdateFamily}
        onDelete={handleDeleteFamilyModal}
        onSetRepresentatives={setRepresentatives}
      />
                  <ImportCensusModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
      
      {/* Modal de confirmación de eliminación */}
      {deleteConfirm && (
        <Modal isOpen={true} onClose={() => setDeleteConfirm(null)} title="Confirmar Eliminación" maxWidth="max-w-md">
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              ¿Estás seguro de que deseas eliminar {deleteConfirm.type === 'user' ? 'al fallero' : 'la familia'} <strong>{deleteConfirm.name}</strong>?
            </p>
            <p className="text-xs text-slate-500">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </Modal>
      )}
      
      <MasterAdminInit />
    </div>
  );
}

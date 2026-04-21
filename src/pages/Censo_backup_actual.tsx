import React, { useState, useMemo } from 'react';
import { useSupabase } from '../lib/SupabaseContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../lib/i18n';
import { Search, Plus, User, Users, Upload, Edit, UserCircle, Calculator } from 'lucide-react';
import { UserFormModal } from '../components/forms/UserFormModal';
import { FamilyFormModal } from '../components/forms/FamilyFormModal';
import { FamilyQuotaModal } from '../components/FamilyQuotaModal';
import { ImportCensusModal } from '../components/admin/ImportCensusModal';
import { RoleManagement } from '../components/admin/RoleManagement';
import { MasterAdminInit } from '../components/admin/MasterAdminInit';

// Funci├│n para calcular la categor├¡a autom├ítica seg├║n la edad (fuera del componente para evitar cache)
const getAutoCategory = (birthYear: string | undefined, categories: any[], currentYear: number): any | undefined => {
  if (!birthYear) return undefined;
  
  // Intentar parsear el a├▒o de nacimiento
  let year: number;
  try {
    // Si es un a├▒o completo (4 d├¡gitos)
    if (birthYear.length === 4) {
      year = parseInt(birthYear);
    }
    // Si es una fecha completa (DD-MM-YYYY o DD/MM/YYYY)
    else if (birthYear.includes('-')) {
      const parts = birthYear.split('-');
      year = parseInt(parts[parts.length - 1]); // Tomar el ├║ltimo elemento como a├▒o
    }
    // Si es una fecha completa con / (DD/MM/YYYY)
    else if (birthYear.includes('/')) {
      const parts = birthYear.split('/');
      year = parseInt(parts[parts.length - 1]); // Tomar el ├║ltimo elemento como a├▒o
    }
    // Si es otro formato, intentar parsear directamente
    else {
      year = parseInt(birthYear);
    }
    
    if (isNaN(year)) return undefined;
  } catch (error) {
    console.error('Error parsing birth year:', birthYear, error);
    return undefined;
  }
  
  const age = currentYear - year;
  
  const matchingCategory = categories
    .filter(cat => {
      // Si no tiene rangos definidos, no se considera para auto-asignaci├│n
      if (cat.minAge === undefined && cat.maxAge === undefined) return false;
      
      const minMatch = cat.minAge === undefined || age >= cat.minAge;
      const maxMatch = cat.maxAge === undefined || age <= cat.maxAge;
      
      return minMatch && maxMatch;
    })
    .sort((a, b) => {
      // Priorizar categor├¡as con rangos m├ís espec├¡ficos
      // 1. Categor├¡as con ambos rangos definidos
      const aHasBoth = a.minAge !== undefined && a.maxAge !== undefined;
      const bHasBoth = b.minAge !== undefined && b.maxAge !== undefined;
      
      if (aHasBoth && !bHasBoth) return -1;
      if (!aHasBoth && bHasBoth) return 1;
      
      // 2. Si ambas tienen ambos rangos, priorizar el m├ís peque├▒o
      if (aHasBoth && bHasBoth) {
        const aRange = (a.maxAge || 0) - (a.minAge || 0);
        const bRange = (b.maxAge || 0) - (b.minAge || 0);
        return aRange - bRange;
      }
      
      // 3. Categor├¡as con un solo rango (priorizar las m├ís espec├¡ficas)
      const aHasMin = a.minAge !== undefined;
      const bHasMin = b.minAge !== undefined;
      if (aHasMin && !bHasMin) return -1;
      if (!aHasMin && bHasMin) return 1;
      
      const aHasMax = a.maxAge !== undefined;
      const bHasMax = b.maxAge !== undefined;
      if (aHasMax && !bHasMax) return -1;
      if (!aHasMax && bHasMax) return 1;
      
      return 0;
    })[0];
  
  return matchingCategory;
};

export default function Censo() {
  const { users, families, categories } = useSupabase();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'usuarios' | 'familias'>('usuarios');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any>(null);
  const [familyToEdit, setFamilyToEdit] = useState<any>(null);
  const [selectedFamily, setSelectedFamily] = useState<any>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const isAdmin = user ? (user.role === 'admin' || user.role === 'master_admin') : false;

  const currentYear = new Date().getFullYear();

  // Funci├│n para determinar el estilo de la fila seg├║n categor├¡a
  const getRowStyle = (category: any) => {
    const categoryName = category?.name?.toLowerCase() || '';
    
    // Infantiles (A y B) con fondo naranja muy claro
    if (categoryName.includes('infantil')) {
      return 'bg-orange-50';
    }
    
    // Resto de categor├¡as sin fondo especial
    return '';
  };

  // Funci├│n para determinar el estilo del texto de categor├¡a
  const getCategoryTextStyle = (category: any, isAuto: boolean) => {
    const categoryName = category?.name?.toLowerCase() || '';
    
    // Infantiles (A y B) con texto naranja
    if (categoryName.includes('infantil')) {
      return 'text-orange-800';
    }
    
    // Resto de categor├¡as con texto gris
    return 'text-slate-700';
  };

  // Funci├│n para formatear nombres correctamente
  const formatUserName = (user: UserType) => {
    const name = user.name || '';
    const apellidos = user.apellidos || '';
    
    // Convertir a formato t├¡tulo (primera letra may├║scula, resto min├║sculas)
    const formatTitle = (str: string) => {
      return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    };
    
    const formattedName = formatTitle(name);
    const formattedApellidos = formatTitle(apellidos);
    
    return apellidos ? `${formattedApellidos}, ${formattedName}` : formattedName;
  };

  const handleEditFamily = (family: Family) => {
    setFamilyToEdit(family);
    setIsFamilyModalOpen(true);
  };

  const handleManageQuotas = (family: Family) => {
    setSelectedFamily(family);
    setIsQuotaModalOpen(true);
  };

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const clearCategoryFilters = () => {
    setSelectedCategories([]);
  };

  const handleOpenFamilyModal = () => {
    setFamilyToEdit(null);
    setIsFamilyModalOpen(true);
  };

  const handleEditUser = (user: UserType) => {
    setUserToEdit(user);
    setIsUserModalOpen(true);
  };

  const handleOpenUserModal = () => {
    setUserToEdit(null);
    setIsUserModalOpen(true);
  };

  const userCategories = useMemo(() => {
    return users.map(user => {
      const category = categories.find(c => c.id === user.categoryId);
      const autoCategory = getAutoCategory(user.anyoNacimiento, categories, currentYear);
      return {
        ...user,
        category,
        autoCategory,
        displayCategory: autoCategory || category
      };
    });
  }, [users, categories, currentYear]);

  const familyCategories = useMemo(() => {
    return families.map(family => {
      const members = users.filter(u => family.members.includes(u.id));
      const representatives = users.filter(u => (family.representativeIds || []).includes(u.id));
      return {
        ...family,
        members,
        representatives
      };
    });
  }, [families, users]);

  const filteredUsers = useMemo(() => {
    let baseUsers = isAdmin 
      ? userCategories.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()))
      : userCategories.filter(u => u.familyId === user?.familyId);
    
    // Aplicar filtro por categor├¡as si hay categor├¡as seleccionadas
    if (selectedCategories.length > 0) {
      baseUsers = baseUsers.filter(u => 
        u.displayCategory && selectedCategories.includes(u.displayCategory?.id)
      );
    }
    
    return baseUsers.sort((a, b) => {
      const surnameA = a.apellidos || '';
      const surnameB = b.apellidos || '';
      return surnameA.localeCompare(surnameB);
    });
  }, [userCategories, searchTerm, isAdmin, user?.familyId, selectedCategories]);
    
  const filteredFamilies = isAdmin
    ? families.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : families.filter(f => f.id === currentUser.familyId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{isAdmin ? t('navCensus') : t('navMyFamily')}</h2>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
            >
              <Upload className="w-5 h-5 sm:mr-2" />
              <span className="hidden sm:inline">Importar CSV</span>
            </button>
            <button 
              onClick={() => activeTab === 'usuarios' ? handleOpenUserModal() : handleOpenFamilyModal()}
              className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              {activeTab === 'usuarios' ? t('addFallero') : t('addFamily')}
            </button>
          </div>
        )}
      </div>

      {/* Tabs & Search */}
      {isAdmin && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('usuarios')}
              className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'usuarios' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4 mr-2" />
              {t('falleros')}
            </button>
            <button
              onClick={() => setActiveTab('familias')}
              className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'familias' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              {t('families')}
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder={activeTab === 'usuarios' ? "Buscar por nombre o apellidos..." : t('searchFamilies')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
            />
          </div>
          
          {/* Filtros por categor├¡as - solo en pesta├▒a de usuarios */}
          {activeTab === 'usuarios' && categories.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Filtrar por:</span>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => {
                  const isSelected = selectedCategories.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryFilter(category.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        isSelected 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  );
                })}
                {selectedCategories.length > 0 && (
                  <button
                    onClick={clearCategoryFilters}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {activeTab === 'usuarios' || !isAdmin ? (
          <div className="h-[800px] overflow-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('colNumCenso')}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('colCodJCF')}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('colSurnames')}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('colName')}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('colCategory')}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('colDNI')}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('colPhone')}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('colAddress')}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('colCity')}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('colCP')}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('colBirth')}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('colSex')}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('colRole')}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('colReward')}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('colFamily')}</th>
                  {isAdmin && <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">{t('colActions')}</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredUsers.map(user => {
                  const family = families.find(f => f.id === user.familyId);
                  return (
                    <tr key={user.id} className={`hover:bg-slate-50 transition-colors ${getRowStyle(user.displayCategory)}`}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.numeroCenso || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.codigoJCF || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.apellidos || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">{user.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                        {user.displayCategory ? (
                          <span className={getCategoryTextStyle(user.displayCategory, !!user.autoCategory)}>
                            {user.displayCategory.name}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.dni || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.telefono || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.direccion || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.poblacion || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.codigoPostal || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.anyoNacimiento || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.sexo || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.cargo || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{user.recompensa || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{family?.name || 'Sin familia'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                        <RoleManagement user={user} onUpdate={() => window.location.reload()} />
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                            title="Editar Fallero"
                          >
                            <Edit className="w-4 h-4 inline-block" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-[800px] overflow-auto divide-y divide-slate-100">
            {filteredFamilies.map(family => {
              const representatives = users.filter(u => (family.representativeIds || []).includes(u.id));
              const familyMembers = users.filter(u => family.members.includes(u.id));
              
              return (
                <div key={family.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-slate-800 flex items-center">
                      {family.name}
                      {isAdmin && (
                        <button 
                          onClick={() => handleEditFamily(family)}
                          className="ml-3 text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Editar Familia"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </h4>
                    <p className="text-sm text-slate-500 mb-2">{t('representative')}: <span className="font-medium text-slate-700">
                      {representatives.length > 0 
                        ? representatives.map(r => formatUserName(r)).join(', ')
                        : 'Ninguno'
                      }
                    </span></p>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {familyMembers.map(member => (
                        <span key={member.id} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <UserCircle className="w-3 h-3 mr-1" />
                          {member.name}
                          {member.id && representatives.some(r => r.id === member.id) && <span className="ml-1 text-indigo-600">(Rep)</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleManageQuotas(family)}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                        title="Gestionar Cuotas"
                      >
                        <Calculator className="w-3 h-3 mr-1" />
                        Cuotas
                      </button>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                        {family.members.length} {t('members')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <UserFormModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} userToEdit={userToEdit} />
      <FamilyFormModal isOpen={isFamilyModalOpen} onClose={() => setIsFamilyModalOpen(false)} familyToEdit={familyToEdit} />
      <ImportCensusModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
      {selectedFamily && (
        <FamilyQuotaModal
          isOpen={isQuotaModalOpen}
          onClose={() => setIsQuotaModalOpen(false)}
          family={selectedFamily}
          familyUsers={users.filter(u => selectedFamily.members.includes(u.id))}
          categories={categories}
          onUpdate={() => {
            // Forzar recarga de datos
            window.location.reload();
          }}
        />
      )}
      
      {/* Componente de inicializaci├│n de Master Admin */}
      <MasterAdminInit />
    </div>
  );
}

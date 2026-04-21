import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useSupabase } from '../../lib/SupabaseContext';
import { useTranslation } from '../../lib/i18n';
import { Family, User } from '../../types';
import { Users, UserPlus, UserMinus, Edit, Trash2, Crown } from 'lucide-react';

interface FamilyManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  family: Family | null;
}

export function FamilyManagementModal({ isOpen, onClose, family }: FamilyManagementModalProps) {
  const { users, categories, updateFamily, deleteFamily } = useSupabase();
  const { t } = useTranslation();
  
  const getAutoCategory = (birthYear: string, categories: any[]) => {
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
      if (actualAge >= cat.min_age && actualAge <= cat.max_age) {
        return true;
      }
      return false;
    });
    
    return matchingCategory || null;
  };
  
  const [formData, setFormData] = useState<Partial<Family>>({
    name: '',
    address: '',
    phone: ''
  });
  
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedRepresentatives, setSelectedRepresentatives] = useState<string[]>([]);

  useEffect(() => {
    if (family) {
      console.log('FamilyManagementModal - Family:', family);
      console.log('FamilyManagementModal - Family members:', family.members);
      console.log('FamilyManagementModal - Users:', users);
      
      setFormData({
        name: family.name,
        address: family.address,
        phone: family.phone
      });
      setSelectedRepresentatives(family.representativeIds || []);
      
      // Usuarios disponibles para añadir a la familia (calcular dinámicamente)
      const familyMembers = users.filter(user => user.family_id === family.id);
      console.log('FamilyManagementModal - Family members filtered:', familyMembers);
      setAvailableUsers(familyMembers);
    }
  }, [family, users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!family) return;
    
    try {
      await updateFamily(family.id, {
        name: formData.name || family.name,
        address: formData.address || family.address,
        phone: formData.phone || family.phone
      });
      
      // Actualizar representantes por separado si es necesario
      // TODO: Implementar función específica para actualizar representantes
      
      onClose();
    } catch (error) {
      console.error("Error updating family:", error);
      alert("Error al actualizar familia. Revisa la consola para más detalles.");
    }
  };

  const handleRepresentativeToggle = (userId: string) => {
    setSelectedRepresentatives(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleDeleteFamily = async () => {
    if (!family || !confirm(`¿Estás seguro de eliminar la familia "${family.name}"?`)) return;
    
    try {
      await deleteFamily(family.id);
      onClose();
    } catch (error) {
      console.error("Error deleting family:", error);
      alert("Error al eliminar familia. Revisa la consola para más detalles.");
    }
  };

  const getAdultUsers = () => {
    return availableUsers.filter(user => {
      if (!user.birth_year) return false;
      
      let birthYear: number;
      if (user.birth_year.includes('/')) {
        const parts = user.birth_year.split('/');
        birthYear = parseInt(parts[parts.length - 1]);
      } else if (user.birth_year.includes('-')) {
        const parts = user.birth_year.split('-');
        birthYear = parseInt(parts[parts.length - 1]);
      } else {
        birthYear = parseInt(user.birth_year);
      }
      
      if (isNaN(birthYear) || birthYear < 1900 || birthYear > 2025) return false;
      
      const currentYear = new Date().getFullYear();
      return (currentYear - birthYear) >= 18;
    });
  };

  if (!family) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${t('manageFamily')}: ${family.name}`}>
      <div className="space-y-6">
        {/* Formulario básico */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('familyName')}</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('address')}</label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('phone')}</label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </form>

        {/* Miembros de la familia */}
        <div>
          <h3 className="text-lg font-medium text-slate-900 mb-3 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            {t('familyMembers')} ({availableUsers.length}) • {selectedRepresentatives.length} {t('representatives')}
          </h3>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {availableUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-medium text-slate-900">
                      {user.name} {user.surname || user.apellidos || ''}
                    </p>
                    <p className="text-sm text-slate-500">
                      <span className={`font-medium ${getAutoCategory(user.birth_year || '', categories)?.color || 'text-slate-500'}`}>
                        {getAutoCategory(user.birth_year || '', categories)?.name || '-'}
                      </span> • {user.email}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getAdultUsers().some(u => u.id === user.id) && (
                    <button
                      type="button"
                      onClick={() => handleRepresentativeToggle(user.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        selectedRepresentatives.includes(user.id)
                          ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title={selectedRepresentatives.includes(user.id) ? t('removeRepresentative') : t('addRepresentative')}
                    >
                      <Crown className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Representantes */}
        <div>
          <h3 className="text-lg font-medium text-slate-900 mb-3 flex items-center">
            <Crown className="h-5 w-5 mr-2" />
            {t('representatives')} ({selectedRepresentatives.length})
          </h3>
          
          <div className="space-y-2">
            {selectedRepresentatives.map(repId => {
              const rep = availableUsers.find(u => u.id === repId);
              if (!rep) return null;
              
              return (
                <div key={rep.id} className="flex items-center justify-between p-2 bg-indigo-50 rounded-lg">
                  <div>
                    <p className="font-medium text-indigo-900">
                      {rep.name} {rep.surname || rep.apellidos || ''}
                    </p>
                    <p className="text-sm text-indigo-700">{t('authorizedForEvents')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRepresentativeToggle(rep.id)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <UserMinus className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleDeleteFamily}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar familia"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 bg-white text-[rgb(48,80,105)] border-3 border-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)] hover:text-white rounded-lg transition-colors"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

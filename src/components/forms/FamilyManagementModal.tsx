import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../lib/i18n';
import { X, Users, Crown, UserPlus, Trash2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  birth_year: string;
  phone?: string;
  role: string;
}

interface Family {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  representativeIds?: string[];
  representative_id?: string; // Nuevo campo para el representante principal
}

interface FamilyManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  family: Family | null;
  users: User[];
  familyRepresentatives: {family_id: string, user_id: string}[];
  onUpdate: (familyId: string, updates: Partial<Family>) => Promise<void>;
  onDelete: (familyId: string) => Promise<void>;
  onSetRepresentatives: (familyId: string, userIds: string[]) => Promise<void>;
}

function FamilyManagementModal({ 
  isOpen, 
  onClose, 
  family, 
  users, 
  familyRepresentatives,
  onUpdate, 
  onDelete,
  onSetRepresentatives 
}: FamilyManagementModalProps) {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<Partial<Family>>({
    name: '',
    address: '',
    phone: ''
  });
  
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedRepresentatives, setSelectedRepresentatives] = useState<string[]>([]);

  useEffect(() => {
    if (family) {
      console.log('🔄 Updating modal with family data:', family);
      setFormData({
        name: family.name,
        address: family.address,
        phone: family.phone
      });
      
      // Cargar representantes desde la nueva tabla
      const reps = familyRepresentatives
        .filter(r => r.family_id === family.id)
        .map(r => r.user_id);
      setSelectedRepresentatives(reps);
      
      const familyMembers = (users || []).filter(user => user.family_id === family.id);
      setAvailableUsers(familyMembers);
    }
  }, [family, users, familyRepresentatives]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!family) return;
    
    try {
      const updates: any = {
        name: formData.name || family.name,
        address: formData.address || family.address,
        phone: formData.phone || family.phone
      };
      
      // Guardar datos básicos de la familia
      console.log('📝 Updates to save:', updates);
      console.log('� Family ID:', family.id);
      await onUpdate(family.id, updates);
      
      // Guardar representantes en la nueva tabla
      console.log('� Saving representatives:', selectedRepresentatives);
      await onSetRepresentatives(family.id, selectedRepresentatives);
      console.log('✅ Update completed successfully');
      
      // Pequeño retraso para que los cambios sean visibles antes de cerrar
      setTimeout(() => {
        console.log('🚪 Closing modal after delay');
        onClose();
      }, 500);
    } catch (error) {
      console.error("❌ Error updating family:", error);
      alert("Error al actualizar familia. Revisa la consola para más detalles.");
    }
  };

  const handleDeleteFamily = async () => {
    if (!family || !confirm(`¿Estás seguro de eliminar la familia "${family.name}"?`)) return;
    
    try {
      await onDelete(family.id);
      onClose();
    } catch (error) {
      console.error("Error deleting family:", error);
      alert("Error al eliminar familia. Revisa la consola para más detalles.");
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

  const handleCloseModal = () => {
    onClose();
  };

  // Función de prueba para acceder desde la consola
  (window as any).testCloseModal = () => {
    handleCloseModal();
  };

  if (!family) return null;

  // No renderizar si el modal no está abierto (después de todos los hooks)
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('manageFamily')}: {family.name}
          </h2>
          <button
            onClick={handleCloseModal}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('familyName')}</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('address')}</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')}</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>

          {/* Miembros de la familia */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              {t('familyMembers')} ({availableUsers.length}) • {selectedRepresentatives.length} {t('representatives')}
            </h3>
            {selectedRepresentatives.length > 0 && (
              <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  {t('representatives')}: {selectedRepresentatives.map(repId => {
                    const rep = availableUsers.find(u => u.id === repId);
                    return rep ? `${rep.name} ${rep.surname || ''}` : '';
                  }).filter(name => name).join(', ')}
                </p>
              </div>
            )}
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.name} {user.surname || ''}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRepresentativeToggle(user.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedRepresentatives.includes(user.id)
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <Crown className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCloseModal}
            className="inline-flex items-center px-4 py-2 bg-white text-[rgb(48,80,105)] border-2 border-[rgb(48,80,105)] rounded-lg hover:bg-[rgb(48,80,105)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[rgb(48,80,105)] focus:ring-offset-2 transition-all text-sm font-medium"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center px-4 py-2 bg-[rgb(48,80,105)] text-white border-2 border-[rgb(48,80,105)] rounded-lg hover:bg-[rgb(48,80,105)] focus:outline-none focus:ring-2 focus:ring-[rgb(48,80,105)] focus:ring-offset-2 transition-all text-sm font-medium"
          >
            {t('save')}
          </button>
          <button
            type="button"
            onClick={handleDeleteFamily}
            className="inline-flex items-center px-4 py-2 bg-white text-red-600 border-2 border-red-300 rounded-lg hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all text-sm font-medium"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t('deleteFamily')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FamilyManagementModal;

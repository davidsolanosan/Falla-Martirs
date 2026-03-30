import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { useData } from '../../lib/DataContext';
import { useTranslation } from '../..//lib/i18n';
import { collection, addDoc, doc, updateDoc, writeBatch, arrayRemove } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Family, User } from '../../types';
import { Search } from 'lucide-react';

interface FamilyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyToEdit?: Family | null;
}

export function FamilyFormModal({ isOpen, onClose, familyToEdit }: FamilyFormModalProps) {
  const { users } = useData();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<Partial<Family>>({
    name: '',
    representativeIds: [],
    members: []
  });
  
  const [searchTerm, setSearchTerm] = useState('');

  // Función para formatear nombres correctamente
  const formatUserName = (user: User) => {
    const name = user.name || '';
    const apellidos = user.apellidos || '';
    
    // Convertir a formato título (primera letra mayúscula, resto minúsculas)
    const formatTitle = (str: string) => {
      return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    };
    
    const formattedName = formatTitle(name);
    const formattedApellidos = formatTitle(apellidos);
    
    return apellidos ? `${formattedApellidos}, ${formattedName}` : formattedName;
  };

  // Filtrar y ordenar usuarios
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter(user => {
      const fullName = formatUserName(user).toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      return fullName.includes(searchLower);
    });

    // Separar miembros actuales y no miembros
    const currentMembers = filtered.filter(user => (formData.members || []).includes(user.id));
    const nonMembers = filtered.filter(user => !(formData.members || []).includes(user.id));

    // Ordenar cada grupo alfabéticamente
    currentMembers.sort((a, b) => formatUserName(a).localeCompare(formatUserName(b)));
    nonMembers.sort((a, b) => formatUserName(a).localeCompare(formatUserName(b)));

    // Miembros actuales primero
    return [...currentMembers, ...nonMembers];
  }, [users, formData.members, searchTerm]);

  // Usuarios que pueden ser representantes (solo miembros actuales)
  const eligibleRepresentatives = useMemo(() => {
    return (formData.members || []).map(memberId => 
      users.find(user => user.id === memberId)
    ).filter(Boolean);
  }, [users, formData.members]);

  React.useEffect(() => {
    if (familyToEdit) {
      setFormData(familyToEdit);
    } else {
      setFormData({
        name: '',
        representativeIds: [],
        members: []
      });
    }
  }, [familyToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const batch = writeBatch(db);
      let familyId = familyToEdit?.id;

      if (familyToEdit && familyId) {
        // Update existing family
        const familyRef = doc(db, 'families', familyId);
        batch.update(familyRef, {
          name: formData.name,
          representativeIds: formData.representativeIds,
          members: formData.members
        });
      } else {
        // Create new family
        const familyRef = doc(collection(db, 'families'));
        familyId = familyRef.id;
        batch.set(familyRef, {
          name: formData.name,
          representativeIds: formData.representativeIds,
          members: formData.members
        });
      }

      // GESTIÓN AUTOMÁTICA DE ASIGNACIONES DOBLES
      const newMembers = formData.members || [];
      const oldMembers = familyToEdit?.members || [];
      
      // Encontrar usuarios que se están moviendo de otras familias
      const usersMovingFromOtherFamilies = newMembers.filter(userId => {
        const user = users.find(u => u.id === userId);
        return user && user.familyId && user.familyId !== familyId;
      });

      // Actualizar familias anteriores (quitar miembros que se están moviendo)
      usersMovingFromOtherFamilies.forEach(userId => {
        const user = users.find(u => u.id === userId);
        if (user && user.familyId) {
          const oldFamilyRef = doc(db, 'families', user.familyId);
          batch.update(oldFamilyRef, {
            members: arrayRemove(userId)
          });
        }
      });

      // Actualizar usuarios (nuevos y existentes)
      const allAffectedUserIds = new Set([
        ...oldMembers,
        ...newMembers
      ]);

      allAffectedUserIds.forEach(userId => {
        const userRef = doc(db, 'users', userId);
        const isNowMember = newMembers.includes(userId);
        const isNowRep = (formData.representativeIds || []).includes(userId);

        if (isNowMember) {
          batch.update(userRef, {
            familyId: familyId,
            isFamilyAdmin: isNowRep
          });
        } else {
          // Si fueron eliminados de esta familia
          batch.update(userRef, {
            familyId: '',
            isFamilyAdmin: false
          });
        }
      });

      await batch.commit();

      // Mostrar mensaje informativo si se movieron usuarios
      if (usersMovingFromOtherFamilies.length > 0) {
        const movedNames = usersMovingFromOtherFamilies
          .map(userId => {
            const user = users.find(u => u.id === userId);
            return user ? formatUserName(user) : '';
          })
          .filter(name => name)
          .join(', ');
        
        alert(`Se han movido automáticamente los siguientes falleros a esta familia:\n${movedNames}`);
      }

      onClose();
      if (!familyToEdit) {
        setFormData({
          name: '',
          representativeIds: [],
          members: []
        });
      }
    } catch (error) {
      console.error("Error saving family:", error);
      alert("Error saving family. Check console for details.");
    }
  };

  const handleMemberToggle = (userId: string) => {
    setFormData(prev => {
      const members = prev.members || [];
      if (members.includes(userId)) {
        return { 
          ...prev, 
          members: members.filter(id => id !== userId),
          // Si era representante, también quitarlo de representantes
          representativeIds: (prev.representativeIds || []).filter(id => id !== userId)
        };
      } else {
        return { ...prev, members: [...members, userId] };
      }
    });
  };

  const handleRepresentativeToggle = (userId: string) => {
    setFormData(prev => {
      const representatives = prev.representativeIds || [];
      if (representatives.includes(userId)) {
        return { 
          ...prev, 
          representativeIds: representatives.filter(id => id !== userId)
        };
      } else {
        return { 
          ...prev, 
          representativeIds: [...representatives, userId],
          // Si no era miembro, añadirlo también como miembro
          members: (prev.members || []).includes(userId) 
            ? prev.members 
            : [...(prev.members || []), userId]
        };
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={familyToEdit ? 'Editar Familia' : t('addFamily')} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('name')}</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Representantes</label>
          
          <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
            {eligibleRepresentatives.length > 0 ? (
              eligibleRepresentatives.map(u => {
                const isRepresentative = (formData.representativeIds || []).includes(u.id);
                const formattedName = formatUserName(u);
                
                return (
                  <label 
                    key={u.id} 
                    className={`flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer transition-colors ${
                      isRepresentative ? 'bg-green-50 border border-green-200' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isRepresentative}
                      onChange={() => handleRepresentativeToggle(u.id)}
                      className="rounded text-green-600 focus:ring-green-500"
                    />
                    <span className={`text-sm ${isRepresentative ? 'text-green-900 font-medium' : 'text-slate-700'}`}>
                      {formattedName}
                    </span>
                    {isRepresentative && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Representante
                      </span>
                    )}
                  </label>
                );
              })
            ) : (
              <div className="text-center py-4 text-slate-500 text-sm">
                Primero selecciona miembros para poder elegir representantes
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t('members')}</label>
          
          {/* Campo de búsqueda */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar fallero..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
            {filteredAndSortedUsers.map(u => {
              const isMember = (formData.members || []).includes(u.id);
              const formattedName = formatUserName(u);
              
              return (
                <label 
                  key={u.id} 
                  className={`flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer transition-colors ${
                    isMember ? 'bg-indigo-50 border border-indigo-200' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isMember}
                    onChange={() => handleMemberToggle(u.id)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className={`text-sm ${isMember ? 'text-indigo-900 font-medium' : 'text-slate-700'}`}>
                    {formattedName}
                  </span>
                  {isMember && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                      Miembro
                    </span>
                  )}
                </label>
              );
            })}
          </div>
          
          {filteredAndSortedUsers.length === 0 && (
            <div className="text-center py-4 text-slate-500 text-sm">
              No se encontraron falleros con "{searchTerm}"
            </div>
          )}
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

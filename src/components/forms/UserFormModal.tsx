import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useSupabase } from '../../lib/SupabaseContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../lib/i18n';
import { User } from '../../lib/supabase';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
}

export function UserFormModal({ isOpen, onClose, userToEdit }: UserFormModalProps) {
  const { families, categories, createUser, updateUser } = useSupabase();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // Verificar si el usuario actual es master_admin
  const isMasterAdmin = user?.role === 'master_admin';
  
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    surname: '',
    email: '',
    dni: '',
    phone: '',
    address: '',
    category_id: '',
    birth_year: '',
    sexo: '',
    cargo: '',
    recompensa: '',
    codigo_jcf: '',
    numero_censo: '',
    poblacion: '',
    codigo_postal: '',
    role: 'user',
    family_id: '',
    event_family_id: ''
  });

  // Initialize form with user data when editing
  React.useEffect(() => {
    if (userToEdit) {
      setFormData({
        name: userToEdit.name || '',
        surname: userToEdit.surname || '',
        email: userToEdit.email || '',
        dni: userToEdit.dni || '',
        phone: userToEdit.phone || '',
        address: userToEdit.address || '',
        birth_year: userToEdit.birth_year || '',
        sexo: userToEdit.sexo || '',
        cargo: userToEdit.cargo || '',
        recompensa: userToEdit.recompensa || '',
        codigo_jcf: userToEdit.codigo_jcf || '',
        numero_censo: userToEdit.numero_censo || '',
        poblacion: userToEdit.poblacion || '',
        codigo_postal: userToEdit.codigo_postal || '',
        role: userToEdit.role || 'user',
        family_id: userToEdit.family_id || '',
        event_family_id: userToEdit.event_family_id || ''
      });
    } else {
      setFormData({
        name: '',
        surname: '',
        email: '',
        dni: '',
        phone: '',
        address: '',
        birth_year: '',
        sexo: '',
        cargo: '',
        recompensa: '',
        codigo_jcf: '',
        numero_censo: '',
        poblacion: '',
        codigo_postal: '',
        role: 'user',
        family_id: '',
        event_family_id: ''
      });
    }
  }, [userToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Remove family_id if empty to avoid UUID error
      const submitData = { ...formData };
      if (!submitData.family_id) {
        delete submitData.family_id;
      }
      
      // Auto-generate email if empty
      if (!submitData.email && submitData.dni) {
        submitData.email = `${submitData.dni}@falla-martirs.com`;
      }
      
      // Check if email is required (not for Infantil or Bebé categories)
      const isInfantileCategory = categories.some(cat => {
        const categoryName = cat.name.toLowerCase();
        return categoryName.includes('infantil') || categoryName.includes('bebé') || categoryName.includes('bebe');
      });
      
      if (!isInfantileCategory && !submitData.email) {
        alert('El correo electrónico es obligatorio para esta categoría. Por favor, introduce un DNI para generar un email automáticamente.');
        return;
      }
      
      if (userToEdit) {
        await updateUser(userToEdit.id, submitData);
      } else {
        await createUser(submitData as Omit<User, 'id' | 'created_at' | 'updated_at'>);
      }
      
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Error al guardar usuario. Revisa la consola para más detalles.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={userToEdit ? t('edit') + ' ' + t('falleros') : t('addFallero')} maxWidth="max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-6">
          {/* Primera fila: Nombre y Apellidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('colName')}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('colSurnames')}</label>
              <input
                type="text"
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Segunda fila: Email y Familia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('email')} {categories.some(cat => cat.name.toLowerCase().includes('infantil') || cat.name.toLowerCase().includes('bebé') || cat.name.toLowerCase().includes('bebe')) ? '(Opcional)' : '(Obligatorio)'}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={formData.dni ? `${formData.dni}@falla-martirs.com` : 'Introduce email o DNI para auto-generar'}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {formData.dni && !formData.email && (
                <p className="text-xs text-slate-500 mt-1">Se generará automáticamente: {formData.dni}@falla-martirs.com</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('colFamily')} (Cuotas)</label>
              <select
                value={formData.family_id}
                onChange={(e) => setFormData({ ...formData, family_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seleccionar...</option>
                {families.sort((a, b) => a.name.localeCompare(b.name)).map(family => (
                  <option key={family.id} value={family.id}>{family.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tercera fila: Familia de Eventos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Familia de Eventos</label>
              <select
                value={formData.event_family_id || formData.family_id}
                onChange={(e) => setFormData({ ...formData, event_family_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Misma que cuotas...</option>
                {families.sort((a, b) => a.name.localeCompare(b.name)).map(family => (
                  <option key={family.id} value={family.id}>{family.name}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Familia desde donde puede apuntar a eventos. Por defecto es la misma que la de cuotas.
              </p>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-slate-600">
                {formData.event_family_id && formData.event_family_id !== formData.family_id ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="font-medium text-blue-800">⚠️ Configuración Especial</p>
                    <p className="text-blue-600">Cuotas: {families.find(f => f.id === formData.family_id)?.name}</p>
                    <p className="text-blue-600">Eventos: {families.find(f => f.id === formData.event_family_id)?.name}</p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="font-medium text-green-800">✅ Configuración Normal</p>
                    <p className="text-green-600">Misma familia para cuotas y eventos</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tercera fila: Campos cortos en 5 columnas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">DNI</label>
              <input
                type="text"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('colPhone')}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Nacimiento</label>
              <input
                type="text"
                value={formData.birth_year}
                onChange={(e) => setFormData({ ...formData, birth_year: e.target.value })}
                placeholder="dd/mm/aaaa o aaaa"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('colCategory')}</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">{t('selectCategory')}</option>
                {categories.map(category => (
                  <option 
                    key={category.id} 
                    value={category.id}
                    className={category.color ? `bg-${category.color} text-white` : ''}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('colSex')}</label>
              <select
                value={formData.sexo}
                onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seleccionar...</option>
                <option value="M">{t('male')}</option>
                <option value="F">{t('female')}</option>
              </select>
            </div>
          </div>

          {/* Quinta fila: Dirección, Población y CP */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('colAddress')}</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('colCity')}</label>
              <input
                type="text"
                value={formData.poblacion}
                onChange={(e) => setFormData({ ...formData, poblacion: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('colCP')}</label>
              <input
                type="text"
                value={formData.codigo_postal}
                onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                maxLength={5}
                placeholder="00000"
              />
            </div>
          </div>

          {/* Sexta fila: Código JCF, Número Censo, Cargo y Recompensa */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('colCodJCF')}</label>
              <input
                type="text"
                value={formData.codigo_jcf}
                onChange={(e) => setFormData({ ...formData, codigo_jcf: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('colNumCenso')}</label>
              <input
                type="text"
                value={formData.numero_censo}
                onChange={(e) => setFormData({ ...formData, numero_censo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('colRole')}</label>
              {isMasterAdmin ? (
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                  <option value="master_admin">Master Admin</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.role || 'user'}
                  disabled
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  readOnly
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('colReward')}</label>
              <input
                type="text"
                value={formData.recompensa}
                onChange={(e) => setFormData({ ...formData, recompensa: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
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
              className="flex items-center justify-center bg-white text-[rgb(48,80,105)] border-3 border-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)] hover:text-white px-3 py-1.5 rounded-xl font-medium transition-all shadow-sm text-sm"
            >
            {userToEdit ? t('update') : t('create')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

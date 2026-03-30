import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useData } from '../../lib/DataContext';
import { useTranslation } from '../../lib/i18n';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User } from '../../types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
}

export function UserFormModal({ isOpen, onClose, userToEdit }: UserFormModalProps) {
  const { families, categories } = useData();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    apellidos: '',
    email: '',
    dni: '',
    telefono: '',
    direccion: '',
    poblacion: '',
    codigoPostal: '',
    anyoNacimiento: '',
    sexo: '',
    cargo: '',
    recompensa: '',
    codigoJCF: '',
    numeroCenso: '',
    role: 'fallero',
    categoryId: '',
    isAdult: true,
    isFamilyAdmin: false,
    familyId: ''
  });

  React.useEffect(() => {
    if (userToEdit) {
      // Solo usar campos que existen en la base de datos, excluir campos calculados
      const dbUser = Object.keys(userToEdit)
        .filter(key => !['autoCategory', 'category', 'displayCategory'].includes(key))
        .reduce((obj, key) => {
          obj[key] = userToEdit[key];
          return obj;
        }, {} as User);
      setFormData(dbUser);
    } else {
      setFormData({
        name: '',
        apellidos: '',
        email: '',
        dni: '',
        telefono: '',
        direccion: '',
        poblacion: '',
        codigoPostal: '',
        anyoNacimiento: '',
        sexo: '',
        cargo: '',
        recompensa: '',
        codigoJCF: '',
        numeroCenso: '',
        role: 'fallero',
        categoryId: '',
        isAdult: true,
        isFamilyAdmin: false,
        familyId: ''
      });
    }
  }, [userToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (userToEdit) {
        await updateDoc(doc(db, 'users', userToEdit.id), formData);
      } else {
        await addDoc(collection(db, 'users'), formData);
      }
      onClose();
      if (!userToEdit) {
        // Reset form
        setFormData({
        name: '',
        apellidos: '',
        email: '',
        dni: '',
        telefono: '',
        direccion: '',
        poblacion: '',
        codigoPostal: '',
        anyoNacimiento: '',
        sexo: '',
        cargo: '',
        recompensa: '',
        codigoJCF: '',
        numeroCenso: '',
        role: 'fallero',
        categoryId: '',
        isAdult: true,
        isFamilyAdmin: false,
        familyId: ''
      });
      }
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Error saving user. Check console for details.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={userToEdit ? 'Editar Fallero' : t('addFallero')} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos</label>
            <input
              type="text"
              value={formData.apellidos}
              onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('email')}</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

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
            <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
            <input
              type="text"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Año Nacimiento</label>
            <input
              type="text"
              value={formData.anyoNacimiento}
              onChange={(e) => setFormData({ ...formData, anyoNacimiento: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Población</label>
            <input
              type="text"
              value={formData.poblacion}
              onChange={(e) => setFormData({ ...formData, poblacion: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">C. Postal</label>
            <input
              type="text"
              value={formData.codigoPostal}
              onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cargo</label>
            <input
              type="text"
              value={formData.cargo}
              onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Recompensa</label>
            <input
              type="text"
              value={formData.recompensa}
              onChange={(e) => setFormData({ ...formData, recompensa: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cód. JCF</label>
            <input
              type="text"
              value={formData.codigoJCF}
              onChange={(e) => setFormData({ ...formData, codigoJCF: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Num. Censo</label>
            <input
              type="text"
              value={formData.numeroCenso}
              onChange={(e) => setFormData({ ...formData, numeroCenso: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('role')}</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="fallero">Fallero</option>
            <option value="admin">Admin</option>
            <option value="directiva">Directiva</option>
            <option value="delegado_festejos">Delegado Festejos</option>
            <option value="delegado_loteria">Delegado Lotería</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('category')}</label>
          <select
            required
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('family')}</label>
          <select
            value={formData.familyId}
            onChange={(e) => setFormData({ ...formData, familyId: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">None</option>
            {families.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isAdult}
              onChange={(e) => setFormData({ ...formData, isAdult: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-slate-700">{t('isAdult')}</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isFamilyAdmin}
              onChange={(e) => setFormData({ ...formData, isFamilyAdmin: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-slate-700">{t('isFamilyAdmin')}</span>
          </label>
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

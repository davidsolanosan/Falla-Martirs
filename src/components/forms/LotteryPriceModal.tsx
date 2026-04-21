import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useSupabase } from '../../lib/SupabaseContext';
import { useTranslation } from '../../lib/i18n';
import { MonthlyLotteryPrice } from '../../types';
import { Calendar, Euro, Save, X } from 'lucide-react';

interface LotteryPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  priceToEdit?: MonthlyLotteryPrice | null;
  year: number;
  month: string;
}

export function LotteryPriceModal({ isOpen, onClose, priceToEdit, year, month }: LotteryPriceModalProps) {
  const { createLotteryPrice, updateLotteryPrice } = useSupabase();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    price: 0,
    discount: 0.50,
    isActive: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (priceToEdit) {
      setFormData({
        price: priceToEdit.price,
        discount: priceToEdit.discount,
        isActive: priceToEdit.isActive
      });
    } else {
      setFormData({
        price: 0,
        discount: 0.50,
        isActive: true
      });
    }
  }, [priceToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const priceData = {
        month,
        year,
        price: formData.price,
        discount: formData.discount,
        is_active: formData.isActive
      };

      if (priceToEdit) {
        await updateLotteryPrice(priceToEdit.id, priceData);
      } else {
        await createLotteryPrice(priceData);
      }
      
      onClose();
    } catch (error) {
      console.error("Error saving lottery price:", error);
      alert("Error al guardar precio de lotería. Revisa la consola para más detalles.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const monthNames = {
    enero: 'Enero',
    febrero: 'Febrero', 
    marzo: 'Marzo',
    abril: 'Abril',
    mayo: 'Mayo',
    junio: 'Junio',
    julio: 'Julio',
    agosto: 'Agosto',
    septiembre: 'Septiembre',
    octubre: 'Octubre',
    noviembre: 'Noviembre',
    diciembre: 'Diciembre'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurar Precio de Lotería">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del mes */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">
                {monthNames[month as keyof typeof monthNames]} {year}
              </h4>
              <p className="text-sm text-blue-700">
                Año fallero: {year}-{year + 1}
              </p>
            </div>
          </div>
        </div>

        {/* Precio de la papeleta */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Euro className="h-4 w-4 inline mr-2" />
            Precio de la Papeleta (€)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0.00"
            required
          />
          <p className="text-xs text-slate-500 mt-1">
            Coste que pagará el cliente por cada papeleta
          </p>
        </div>

        {/* Descuento en quota */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Descuento en Quota Mensual (€)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0.50"
          />
          <p className="text-xs text-slate-500 mt-1">
            Descuento aplicado por cada papeleta vendida (normalmente 0,50€)
          </p>
        </div>

        {/* Estado activo */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-slate-700">
            Disponible para venta
          </label>
        </div>
        <p className="text-xs text-slate-500">
          Si está marcado, las familias podrán vender papeletas este mes
        </p>

        {/* Resumen */}
        {formData.price > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-900 mb-2">Resumen</h4>
            <div className="space-y-1 text-sm text-green-700">
              <p>• Precio papeleta: <strong>{formData.price.toFixed(2)}€</strong></p>
              <p>• Descuento quota: <strong>{formData.discount.toFixed(2)}€</strong></p>
              <p>• Beneficio por papeleta: <strong>{(formData.price - formData.discount).toFixed(2)}€</strong></p>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
          >
            <X className="h-4 w-4 inline mr-2" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

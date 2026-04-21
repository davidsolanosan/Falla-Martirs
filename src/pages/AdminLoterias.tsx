import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminLoterias() {
  const [lotteryDates, setLotteryDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    date: '',
    name: '',
    special: false,
    lottery_price: 0.50,
    primitive_price: 0.30,
    donation_price: 0.20
  });

  useEffect(() => {
    loadLotteryDates();
  }, []);

  const loadLotteryDates = async () => {
    const { data, error } = await supabase
      .from('lottery_dates')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) {
      console.error('Error cargando sorteos:', error);
    } else {
      setLotteryDates(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data, error } = await supabase
      .from('lottery_dates')
      .insert([{
        date: formData.date,
        name: formData.name,
        special: formData.special,
        lottery_price: formData.lottery_price,
        primitive_price: formData.primitive_price,
        donation_price: formData.donation_price
      }]);
    
    if (error) {
      console.error('Error creando sorteo:', error);
      alert('Error creando sorteo: ' + error.message);
    } else {
      alert('Sorteo creado exitosamente');
      setShowForm(false);
      setFormData({
        date: '',
        name: '',
        special: false,
        lottery_price: 0.50,
        primitive_price: 0.30,
        donation_price: 0.20
      });
      loadLotteryDates();
    }
  };

  const deleteLotteryDate = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este sorteo?')) return;
    
    const { error } = await supabase
      .from('lottery_dates')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error eliminando sorteo:', error);
      alert('Error eliminando sorteo: ' + error.message);
    } else {
      alert('Sorteo eliminado');
      loadLotteryDates();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-purple-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-purple-800">
              Administración de Loterías
            </h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              {showForm ? 'Cancelar' : '+ Nuevo Sorteo'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-purple-50 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-semibold text-purple-700 mb-4">Crear Nuevo Sorteo</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-1">
                    Fecha del Sorteo
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-1">
                    Nombre del Sorteo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Lotería Semanal"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.special}
                      onChange={(e) => setFormData({...formData, special: e.target.checked})}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-sm font-medium text-purple-700">Sorteo Especial</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-1">
                    Precio Lotería (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.lottery_price}
                    onChange={(e) => setFormData({...formData, lottery_price: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-1">
                    Precio Primitiva (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.primitive_price}
                    onChange={(e) => setFormData({...formData, primitive_price: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-1">
                    Precio Donación (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.donation_price}
                    onChange={(e) => setFormData({...formData, donation_price: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                >
                  Crear Sorteo
                </button>
              </div>
            </form>
          )}

          <div>
            <h2 className="text-xl font-semibold text-purple-700 mb-4">Sorteos Existentes</h2>
            
            {lotteryDates.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded">
                <p className="text-gray-600">No hay sorteos creados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lotteryDates.map((date: any) => (
                  <div key={date.id} className="bg-purple-50 p-4 rounded border border-purple-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-purple-900">{date.name}</h3>
                          {date.special && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                              Especial
                            </span>
                          )}
                        </div>
                        <p className="text-purple-600 text-sm">{date.date}</p>
                        <div className="mt-2 text-sm text-purple-700">
                          <p>Lotería: €{date.lottery_price} | Primitiva: €{date.primitive_price} | Donación: €{date.donation_price}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteLotteryDate(date.id)}
                        className="text-red-600 hover:text-red-800 ml-4"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

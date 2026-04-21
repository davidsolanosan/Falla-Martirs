import React, { useEffect, useState } from 'react';

// Importar Supabase directamente para evitar problemas de contexto
import { supabase } from '../lib/supabase';

export default function LoteriasTestSimple() {
  const [lotteryDates, setLotteryDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Iniciando carga de datos...');
    
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Cargando lottery_dates...');
        const { data, error } = await supabase
          .from('lottery_dates')
          .select('*');
        
        if (error) {
          console.error('Error cargando lottery_dates:', error);
          setError(error.message);
          return;
        }
        
        console.log('Datos cargados:', data);
        setLotteryDates(data || []);
        
      } catch (err) {
        console.error('Error general:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-red-600 text-6xl mb-4">Error</div>
          <h2 className="text-xl font-bold text-red-800 mb-2">Error de Carga</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="text-sm text-gray-500">
            <p>Revisa la consola para más detalles</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-6 text-center">
            Test Simple de Loterías
          </h1>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">
              Fechas de Lotería ({lotteryDates.length})
            </h2>
            
            {lotteryDates.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded">
                <p className="text-gray-600">No hay fechas de lotería</p>
                <p className="text-sm text-gray-500 mt-2">
                  La conexión funciona pero no hay datos
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {lotteryDates.map((date) => (
                  <div key={date.id} className="bg-blue-50 p-4 rounded border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-900">{date.name}</span>
                      <span className="text-blue-600">{date.date}</span>
                      {date.special && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                          Especial
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="text-center mt-8">
            <div className="bg-green-50 p-4 rounded">
              <h3 className="text-green-800 font-semibold mb-2">Estado de la Conexión</h3>
              <p className="text-green-600">Conexión con Supabase: <strong>Funcionando</strong></p>
              <p className="text-green-600">Carga de datos: <strong>Exitosa</strong></p>
              <p className="text-green-600">Total registros: <strong>{lotteryDates.length}</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

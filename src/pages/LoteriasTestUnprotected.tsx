import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function LoteriasTestUnprotected() {
  const [lotteryDates, setLotteryDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Iniciando carga de datos (sin protección)...');
    
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
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-purple-600">Cargando datos (sin protección)...</p>
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-purple-800 mb-6 text-center">
            Test SIN Protección de Loterías
          </h1>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-purple-700 mb-4">
              Fechas de Lotería ({lotteryDates.length})
            </h2>
            
            {lotteryDates.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded">
                <p className="text-gray-600">No hay fechas de lotería</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lotteryDates.map((date) => (
                  <div key={date.id} className="bg-purple-50 p-4 rounded border border-purple-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-purple-900">{date.name}</span>
                      <span className="text-purple-600">{date.date}</span>
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
              <h3 className="text-green-800 font-semibold mb-2">Estado (Sin Protección)</h3>
              <p className="text-green-600">Conexión: <strong>Funcionando</strong></p>
              <p className="text-green-600">Datos: <strong>{lotteryDates.length} registros</strong></p>
              <p className="text-green-600">Autenticación: <strong>No requerida</strong></p>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Si esta página funciona, el problema está en ProtectedRoute
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

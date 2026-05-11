import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useSupabase } from '../../lib/SupabaseContext';
import { RefreshCw, CheckCircle, AlertCircle, FileText } from 'lucide-react';

export default function ActualizarNoticiasEventos() {
  const { t } = useTranslation();
  const { events, updateNews } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{success: number, error: number, total: number}>({success: 0, error: 0, total: 0});
  const [processing, setProcessing] = useState(false);

  const generateImprovedNewsContent = (event: any) => {
    return `
      <h2>📅 ${event.title}</h2>
      
      <h3>📋 Detalls de l'Esdeveniment:</h3>
      <p><strong>Data:</strong> ${event.event_date}</p>
      <p><strong>Hora:</strong> ${event.time || 'Per determinar'}</p>
      <p><strong>Lloc:</strong> ${event.site || 'Per determinar'}</p>
      <p><strong>Preu:</strong> Veure preus per categoria</p>
      <p><strong>Inclou menjar:</strong> ${event.includes_meal ? 'Sí' : 'No'}</p>
      
      <br><br>
      
      <h3>📝 Descripció:</h3>
      <div>${event.description || 'Sense descripció addicional'}</div>
      
      <br><br>
      
      <h3>📅 Informació d'Inscripció:</h3>
      <p><strong>Data límit:</strong> ${event.registration_deadline}</p>
      <p><strong>Estat:</strong> ${event.is_active ? 'Actiu' : 'Inactiu'}</p>
      
      <br><br>
      
      <p><em>Per inscriure-te, visita la secció d'Events.</em></p>
    `;
  };

  const updateAllEventNews = async () => {
    setLoading(true);
    setProcessing(true);
    setResults({success: 0, error: 0, total: 0});

    const eventsWithNews = events.filter(event => event.news_id);
    const totalEvents = eventsWithNews.length;
    
    console.log(`🔄 Iniciando actualización de ${totalEvents} noticias de eventos`);

    for (const event of eventsWithNews) {
      try {
        const improvedContent = generateImprovedNewsContent(event);
        
        const newsData = {
          title: `📅 ${event.title} - Informació Completa`,
          content: improvedContent,
          image_url: event.image_url,
          author: 'Falla Màrtirs',
          status: 'published' as const
        };

        await updateNews(event.news_id, newsData);
        
        setResults(prev => ({
          ...prev,
          success: prev.success + 1
        }));
        
        console.log(`✅ Noticia actualizada: ${event.title} (${event.news_id})`);
        
        // Pequeña pausa para no sobrecargar la API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error actualizando noticia de ${event.title}:`, error);
        setResults(prev => ({
          ...prev,
          error: prev.error + 1
        }));
      }
    }

    setResults(prev => ({
      ...prev,
      total: totalEvents
    }));
    
    setProcessing(false);
    setLoading(false);
    
    console.log(`🏁 Actualización completada: ${results.success + 1} exitosas, ${results.error + 1} errores`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgb(239,246,255)' }}>
              <FileText className="w-6 h-6" style={{ color: 'rgb(48,80,105)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'rgb(48,80,105)' }}>
                Actualizar Noticias de Eventos
              </h1>
              <p className="text-slate-600">
                Actualiza todas las noticias existentes de eventos al nuevo formato bilingüe
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">¿Qué hace esta herramienta?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Actualiza todas las noticias de eventos existentes al nuevo formato</li>
                <li>• Convierte el contenido a formato bilingüe (valenciano)</li>
                <li>• Mejora el espaciado y estructura visual</li>
                <li>• Cambia el autor a "Falla Màrtirs"</li>
                <li>• Simplifica el texto final de llamada a la acción</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <div className="text-2xl font-bold text-slate-800">
                {events.filter(e => e.news_id).length}
              </div>
              <div className="text-sm text-slate-600">Eventos con noticia</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">
                {results.success}
              </div>
              <div className="text-sm text-green-600">Actualizadas</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <div className="text-2xl font-bold text-red-600">
                {results.error}
              </div>
              <div className="text-sm text-red-600">Errores</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <button
            onClick={updateAllEventNews}
            disabled={loading || processing}
            className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-[rgb(48,80,105)] text-white rounded-xl hover:bg-[rgb(38,70,95)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Actualizando noticias...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                <span>Actualizar Todas las Noticias</span>
              </>
            )}
          </button>

          {/* Progress */}
          {processing && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                <span>Progreso</span>
                <span>{results.success + results.error} / {results.total || events.filter(e => e.news_id).length}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-[rgb(48,80,105)] h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${results.total > 0 ? ((results.success + results.error) / results.total) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Results */}
          {results.total > 0 && !processing && (
            <div className="mt-6 p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center space-x-3">
                {results.error === 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                )}
                <div>
                  <h4 className="font-semibold text-slate-800">
                    {results.error === 0 ? 'Actualización Completada' : 'Actualización con Errores'}
                  </h4>
                  <p className="text-sm text-slate-600">
                    {results.success} noticias actualizadas correctamente
                    {results.error > 0 && ` • ${results.error} con errores`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

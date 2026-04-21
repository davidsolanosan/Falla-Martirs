import React from 'react';
import { useTranslation } from '../lib/i18n';
import { PlusIcon, LightBulbIcon } from '@heroicons/react/24/outline';

export default function Crear() {
  const { t, language } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <PlusIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {language === 'va' ? 'Crear' : 'Crear'}
              </h1>
              <p className="text-slate-600">
                {language === 'va' 
                  ? 'Secció en desenvolupament. Aviat podràs crear nou contingut.'
                  : 'Sección en desarrollo. Pronto podrás crear nuevo contenido.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="text-center py-12">
            <LightBulbIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              {language === 'va' ? 'Propera Novetat' : 'Próxima Novedad'}
            </h2>
            <p className="text-slate-600 max-w-md mx-auto">
              {language === 'va'
                ? 'Estem treballant en noves funcionalitats per a esta secció. Aviat podràs crear i gestionar nou contingut de forma senzilla.'
                : 'Estamos trabajando en nuevas funcionalidades para esta sección. Pronto podrás crear y gestionar nuevo contenido de forma sencilla.'
              }
            </p>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2">
                {language === 'va' ? 'Idees per al futur:' : 'Ideas para el futuro:'}
              </h3>
              <ul className="text-sm text-blue-700 space-y-1 text-left max-w-xs mx-auto">
                <li>· {language === 'va' ? 'Crear esdeveniments personalitzats' : 'Crear eventos personalizados'}</li>
                <li>· {language === 'va' ? 'Dissenyar formularis personalitzats' : 'Diseñar formularios personalizados'}</li>
                <li>· {language === 'va' ? 'Generar informes automàtics' : 'Generar informes automáticos'}</li>
                <li>· {language === 'va' ? 'Crear plantilles reutilitzables' : 'Crear plantillas reutilizables'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Development Info */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <LightBulbIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                {language === 'va' ? 'En desenvolupament' : 'En desarrollo'}
              </h3>
              <p className="text-sm text-yellow-700">
                {language === 'va'
                  ? 'Aquesta secció està actualment en desenvolupament. Les funcionalitats estaran disponibles en futures actualitzacions.'
                  : 'Esta sección está actualmente en desarrollo. Las funcionalidades estarán disponibles en futuras actualizaciones.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

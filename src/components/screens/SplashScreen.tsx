import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../lib/i18n';

export function SplashScreen() {
  const [showContent, setShowContent] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Mostrar el logo durante 1 segundo, luego mostrar el login
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!showContent) {
    // Pantalla de carga con el logo
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="w-32 h-32 flex items-center justify-center animate-pulse">
          <img 
            src="/logo-blaus.jpg" 
            alt={t('appTitle')} 
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
        <h1 className="text-3xl font-bold text-[rgb(48,80,105)] mt-6 text-center animate-fade-in">
          {t('appTitle')}
        </h1>
      </div>
    );
  }

  // Devolver null para que el componente principal renderice el login
  return null;
}

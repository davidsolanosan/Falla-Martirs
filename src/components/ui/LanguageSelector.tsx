import React from 'react';
import { useTranslation } from '../../lib/i18n';

export function LanguageSelector() {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage('va')}
        className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
          language === 'va'
            ? 'bg-slate-100 text-slate-700 border border-slate-300'
            : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
        }`}
      >
        🇪🇸 Valencià
      </button>
      <button
        onClick={() => setLanguage('es')}
        className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
          language === 'es'
            ? 'bg-slate-100 text-slate-700 border border-slate-300'
            : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
        }`}
      >
        🇪🇸 Castellano
      </button>
    </div>
  );
}

import React from 'react';
import { useTranslation } from '../../lib/i18n';
import { Beer } from 'lucide-react';
import BarraAdmin from '../../components/barra/BarraAdmin';

export default function BarraAdminPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#4649711a' }}>
              <Beer className="w-6 h-6" style={{ color: '#464971' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{t('navAdminBar')}</h1>
              <p className="text-slate-500 text-sm">{t('qrBarAdminSubtitle')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <BarraAdmin />
        </div>
      </div>
    </div>
  );
}

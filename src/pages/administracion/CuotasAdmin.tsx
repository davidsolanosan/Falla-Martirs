import React from 'react';
import { useTranslation } from '../../lib/i18n';
import { Plus, CreditCard, TrendingUp, Users } from 'lucide-react';

export default function CuotasAdmin() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {t('navAdminQuotas')}
                </h1>
                <p className="text-slate-600">
                  {t('adminQuotasDescription')}
                </p>
              </div>
            </div>
            <button
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('configurePayment')}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              {t('sectionInDevelopment')}
            </h2>
            <p className="text-slate-600 max-w-md mx-auto">
              {t('adminQuotasInDevelopment')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

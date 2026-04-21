import React from 'react';
import { useTranslation } from '../../lib/i18n';
import { Plus, Lightbulb, Code, Zap, Globe } from 'lucide-react';

export default function CrearAdmin() {
  const { t } = useTranslation();

  const features = [
    {
      name: t('customForms'),
      description: t('customFormsDescription'),
      icon: Code,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      name: t('automatedReports'),
      description: t('automatedReportsDescription'),
      icon: Zap,
      color: 'bg-green-100 text-green-600'
    },
    {
      name: t('reusableTemplates'),
      description: t('reusableTemplatesDescription'),
      icon: Globe,
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {t('navAdminCreate')}
              </h1>
              <p className="text-slate-600">
                {t('adminCreateDescription')}
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`p-3 ${feature.color} rounded-xl`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {feature.name}
                  </h3>
                </div>
                <p className="text-slate-600 text-sm">
                  {feature.description}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('create')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
          <div className="text-center py-8">
            <Lightbulb className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              {t('comingSoon')}
            </h2>
            <p className="text-slate-600 max-w-md mx-auto">
              {t('adminCreateComingSoon')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

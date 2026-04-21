import React from 'react';
import { useTranslation } from '../../lib/i18n';
import { Settings, Shield, Database, Bell, Palette } from 'lucide-react';

export default function ConfiguracionAdmin() {
  const { t } = useTranslation();

  const settings = [
    {
      name: t('generalSettings'),
      description: t('generalSettingsDescription'),
      icon: Settings,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      name: t('securitySettings'),
      description: t('securitySettingsDescription'),
      icon: Shield,
      color: 'bg-red-100 text-red-600'
    },
    {
      name: t('databaseSettings'),
      description: t('databaseSettingsDescription'),
      icon: Database,
      color: 'bg-green-100 text-green-600'
    },
    {
      name: t('notificationSettings'),
      description: t('notificationSettingsDescription'),
      icon: Bell,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      name: t('appearanceSettings'),
      description: t('appearanceSettingsDescription'),
      icon: Palette,
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {t('navAdminSettings')}
              </h1>
              <p className="text-slate-600">
                {t('adminSettingsDescription')}
              </p>
            </div>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settings.map((setting, index) => {
            const Icon = setting.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`p-3 ${setting.color} rounded-xl`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {setting.name}
                  </h3>
                </div>
                <p className="text-slate-600 text-sm">
                  {setting.description}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    {t('configure')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* System Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mt-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6">
            {t('systemInformation')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-600">{t('appVersion')}:</span>
                <span className="font-medium text-slate-800">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">{t('lastUpdate')}:</span>
                <span className="font-medium text-slate-800">19/04/2026</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-600">{t('database')}:</span>
                <span className="font-medium text-slate-800">Supabase</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">{t('environment')}:</span>
                <span className="font-medium text-slate-800">Production</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

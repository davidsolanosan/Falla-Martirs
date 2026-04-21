import React from 'react';
import { useTranslation } from '../../lib/i18n';
import { Plus, FileText, Image, Award, FolderOpen } from 'lucide-react';

export default function DocumentosAdmin() {
  const { t } = useTranslation();

  const sections = [
    {
      name: t('documents'),
      description: t('documentsDescription'),
      icon: FileText,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      name: t('gallery'),
      description: t('galleryDescription'),
      icon: Image,
      color: 'bg-green-100 text-green-600'
    },
    {
      name: t('rewards'),
      description: t('rewardsDescription'),
      icon: Award,
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
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {t('navAdminDocuments')}
              </h1>
              <p className="text-slate-600">
                {t('adminDocumentsDescription')}
              </p>
            </div>
          </div>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`p-3 ${section.color} rounded-xl`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {section.name}
                  </h3>
                </div>
                <p className="text-slate-600 text-sm">
                  {section.description}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('manage')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Files */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6">
            {t('recentFiles')}
          </h2>
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">
              {t('noRecentFiles')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

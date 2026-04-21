import React, { useState } from 'react';
import { useTranslation } from '../lib/i18n';
import { FileText, Image, Award, Download, Search, Filter } from 'lucide-react';

// Definir tipos para TypeScript
interface BaseItem {
  id: number;
  name: string;
  date: string;
}

interface DocumentItem extends BaseItem {
  type: string;
  size: string;
}

interface GalleryItem extends BaseItem {
  type: string;
  count: number;
}

interface RewardItem extends BaseItem {
  amount: string;
}

type ContentItem = DocumentItem | GalleryItem | RewardItem;

export default function Documentos() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('documentos');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'documentos', name: t('documents'), icon: FileText },
    { id: 'galeria', name: t('gallery'), icon: Image },
    { id: 'recompensas', name: t('rewards'), icon: Award }
  ];

  // Datos de ejemplo - vendrán de la base de datos
  const documentItems: DocumentItem[] = [
    { id: 1, name: 'Acta Reunión Febrero 2026.pdf', type: 'PDF', size: '1.2 MB', date: '2026-02-28' },
    { id: 2, name: 'Normativa Lotería.pdf', type: 'PDF', size: '0.8 MB', date: '2026-01-15' },
    { id: 3, name: 'Programa de Festejos 2026.pdf', type: 'PDF', size: '2.5 MB', date: '2026-03-01' }
  ];

  const galleryItems: GalleryItem[] = [
    { id: 1, name: 'Fiesta Falla 2025', type: 'Imagen', count: 24 },
    { id: 2, name: 'Desfile 2025', type: 'Imagen', count: 18 },
    { id: 3, name: 'Actos Oficiales', type: 'Imagen', count: 12 }
  ];

  const rewardItems: RewardItem[] = [
    { id: 1, name: 'Premio Participación 2025', amount: '€50', date: '20/12/2025' },
    { id: 2, name: 'Bono Familia Numerosa', amount: '€100', date: '15/07/2025' }
  ];

  const getCurrentContent = (): ContentItem[] => {
    switch (activeTab) {
      case 'documentos':
        return documentItems;
      case 'galeria':
        return galleryItems;
      case 'recompensas':
        return rewardItems;
      default:
        return documentItems;
    }
  };

  const filteredContent = getCurrentContent().filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {t('navDocuments')}
              </h1>
              <p className="text-slate-600">
                {t('documentsDashboardDescription')}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 mb-6">
          <div className="flex border-b border-slate-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-600 hover:text-slate-800 border-b-2 border-transparent hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('searchDocuments')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          {activeTab === 'documentos' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {t('name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {t('type')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {t('size')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {t('date')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredContent.map((doc, index) => (
                    <tr key={doc.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {doc.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {'type' in doc ? doc.type : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {'size' in doc ? doc.size : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {doc.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'galeria' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredContent.map((album) => (
                <div key={album.id} className="bg-slate-50 rounded-xl p-6 hover:bg-slate-100 transition-colors cursor-pointer">
                  <Image className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-800 text-center mb-2">
                    {album.name}
                  </h3>
                  <p className="text-sm text-slate-600 text-center">
                    {'count' in album ? album.count : 0} {t('photos')}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'recompensas' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {t('name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {t('amount')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {t('date')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredContent.map((reward, index) => (
                    <tr key={reward.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {reward.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {'amount' in reward ? reward.amount : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {reward.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

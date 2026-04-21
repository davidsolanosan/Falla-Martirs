import React from 'react';
import { useTranslation } from '../lib/i18n';
import { FileText, Calendar, User } from 'lucide-react';

export default function Noticias() {
  const { t } = useTranslation();

  // Datos de ejemplo - vendrán de la base de datos
  const news = [
    {
      id: 1,
      title: 'Nueva reunión de la Falla',
      content: 'Se convoca a todos los falleros a la reunión ordinaria del próximo martes...',
      date: '18/04/2026',
      author: 'Administración',
      category: 'general'
    },
    {
      id: 2,
      title: 'Fiesta de la Falla',
      content: 'Este sábado celebraremos nuestra fiesta anual en la plaza mayor...',
      date: '15/04/2026',
      author: 'Comisión de Festejos',
      category: 'eventos'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {t('navNews')}
              </h1>
              <p className="text-slate-600">
                {t('newsDescription')}
              </p>
            </div>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {news.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  item.category === 'general' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {item.category === 'general' ? t('general') : t('events')}
                </span>
                <span className="text-sm text-slate-500">
                  {item.date}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {item.title}
              </h3>
              
              <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                {item.content}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center text-sm text-slate-500">
                  <User className="w-4 h-4 mr-1" />
                  {item.author}
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  {t('readMore')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

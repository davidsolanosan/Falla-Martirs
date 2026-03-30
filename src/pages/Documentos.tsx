import React from 'react';
import { FileText, Download, Upload } from 'lucide-react';
import { useData } from '../lib/DataContext';
import { useTranslation } from '../lib/i18n';

export default function Documentos() {
  const { currentUser } = useData();
  const { t } = useTranslation();
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'directiva';

  const documents = [
    { id: 1, name: 'Acta Reunión Febrero 2026.pdf', date: '2026-02-28', size: '1.2 MB' },
    { id: 2, name: 'Normativa Lotería.pdf', date: '2026-01-15', size: '0.8 MB' },
    { id: 3, name: 'Programa de Festejos 2026.pdf', date: '2026-03-01', size: '2.5 MB' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{t('navDocs')}</h2>
        {isAdmin && (
          <button className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
            <Upload className="w-5 h-5 mr-2" />
            {t('uploadPdf')}
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {documents.map(doc => (
            <div key={doc.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-red-50 text-red-500 rounded-2xl mr-4">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800">{doc.name}</h4>
                  <p className="text-sm text-slate-500">{doc.date} • {doc.size}</p>
                </div>
              </div>
              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

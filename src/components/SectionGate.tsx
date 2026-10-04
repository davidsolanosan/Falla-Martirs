import React from 'react';
import { useTranslation } from '../lib/i18n';
import { useSupabase } from '../lib/SupabaseContext';
import { useAuth } from '../context/AuthContext';
import { Hammer, EyeOff } from 'lucide-react';

interface SectionGateProps {
  section: string;
  children: React.ReactNode;
}

/**
 * Envuelve una sección de usuario. Si la sección está desactivada en
 * section_status, los falleros ven una pantalla "en construcción".
 * Los administradores siempre ven la sección real con un aviso.
 * Si no hay fila para la sección, se considera activa (fail-open).
 */
export default function SectionGate({ section, children }: SectionGateProps) {
  const { t } = useTranslation();
  const { sectionStatus } = useSupabase();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin' || user?.role === 'master_admin';
  const row = sectionStatus.find(s => s.section === section);
  const enabled = row ? row.enabled : true;

  if (!enabled && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-md w-full text-center">
          <div className="p-4 rounded-full bg-amber-50 w-fit mx-auto mb-4">
            <Hammer className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold mb-3" style={{ color: 'rgb(48,80,105)' }}>
            {t('sectionUnderConstruction')}
          </h1>
          <p className="text-slate-600">
            {t('underConstructionMessage')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!enabled && isAdmin && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-2 text-sm text-amber-800">
          <EyeOff className="w-4 h-4 flex-shrink-0" />
          <span>{t('adminSectionPreview')}</span>
        </div>
      )}
      {children}
    </>
  );
}

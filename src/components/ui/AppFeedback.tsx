import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';

type ToastType = 'info' | 'success' | 'error';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ConfirmState {
  message: string;
  resolve: (ok: boolean) => void;
}

let pushToast: ((message: string, type?: ToastType) => void) | null = null;
let pushConfirm: ((message: string) => Promise<boolean>) | null = null;

/**
 * Reemplazo de window.confirm() con diálogo propio.
 * Devuelve una Promise<boolean>; usar con await.
 */
export function appConfirm(message: string): Promise<boolean> {
  if (pushConfirm) {
    return pushConfirm(message);
  }
  // Fallback por si se llama antes de montar el host
  return Promise.resolve(window.confirm(message));
}

/**
 * Host global de toasts y diálogos de confirmación.
 * Sustituye window.alert por un toast con la marca de la app,
 * evitando que el navegador muestre el dominio en los diálogos.
 * Montar una sola vez dentro de LanguageProvider.
 */
export function AppFeedbackHost() {
  const { t } = useTranslation();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  useEffect(() => {
    pushToast = (message, type = 'info') => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, 4000);
    };

    pushConfirm = (message) =>
      new Promise<boolean>((resolve) => {
        setConfirmState({ message, resolve });
      });

    const originalAlert = window.alert;
    window.alert = (msg?: unknown) => {
      pushToast!(String(msg ?? ''), 'info');
    };

    return () => {
      window.alert = originalAlert;
      pushToast = null;
      pushConfirm = null;
    };
  }, []);

  const closeConfirm = (ok: boolean) => {
    confirmState?.resolve(ok);
    setConfirmState(null);
  };

  const toastIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />;
      default: return <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />;
    }
  };

  return (
    <>
      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-[9999] space-y-2 w-96 max-w-[calc(100vw-2rem)]">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
          >
            <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 tracking-wide">FALLA MÀRTIRS</span>
            </div>
            <div className="flex items-start gap-3 p-4">
              {toastIcon(toast.type)}
              <p className="flex-1 text-sm text-slate-700 whitespace-pre-line">{toast.message}</p>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-slate-400 hover:text-slate-600 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirm dialog */}
      {confirmState && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-slate-900/50"
          onClick={() => closeConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-700 tracking-wide">FALLA MÀRTIRS</span>
            </div>
            <div className="p-5">
              <p className="text-slate-700 whitespace-pre-line">{confirmState.message}</p>
            </div>
            <div className="flex border-t border-slate-100">
              <button
                onClick={() => closeConfirm(false)}
                className="flex-1 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => closeConfirm(true)}
                className="flex-1 px-4 py-3 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                {t('accept')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

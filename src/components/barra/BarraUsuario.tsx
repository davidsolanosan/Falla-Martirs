import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useSupabase } from '../../lib/SupabaseContext';
import { useAuth } from '../../context/AuthContext';
import { QrCode, Plus, Minus, CheckCircle, Clock, XCircle, X, Beer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { appConfirm, appToast } from '../ui/AppFeedback';
import { QrProduct, QrTicket } from '../../lib/supabase';

// Un producto está "visible" si is_active y (sin periodo o dentro del periodo)
export function isProductAvailable(p: QrProduct): boolean {
  if (!p.is_active) return false;
  const now = new Date();
  if (p.active_from && new Date(p.active_from) > now) return false;
  if (p.active_until && new Date(p.active_until) < now) return false;
  return true;
}

export default function BarraUsuario() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { qrProducts, qrTickets, createQrTicket, cancelQrTicket } = useSupabase();

  const [quantities, setQuantities] = useState<{ [productId: string]: number }>({});
  const [qrTicket, setQrTicket] = useState<QrTicket | null>(null);
  const [generating, setGenerating] = useState(false);

  const availableProducts = useMemo(
    () => (qrProducts || []).filter(isProductAvailable),
    [qrProducts]
  );

  // Tickets del usuario, agrupados por día (más reciente primero)
  const myTicketsByDay = useMemo(() => {
    const mine = (qrTickets || []).filter(tk => tk.user_id === user?.id);
    const groups: { [day: string]: QrTicket[] } = {};
    mine.forEach(tk => {
      const day = new Date(tk.created_at).toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
      if (!groups[day]) groups[day] = [];
      groups[day].push(tk);
    });
    return Object.entries(groups);
  }, [qrTickets, user?.id]);

  const getQty = (productId: string) => quantities[productId] || 1;

  const setQty = (productId: string, qty: number) => {
    setQuantities(prev => ({ ...prev, [productId]: Math.min(20, Math.max(1, qty)) }));
  };

  const handleGenerate = async (product: QrProduct) => {
    const quantity = getQty(product.id);
    if (!user?.id) return;

    setGenerating(true);
    try {
      const ticket = await createQrTicket({
        product_id: product.id,
        user_id: user.id,
        family_id: user.family_id || null,
        quantity,
        unit_price: product.price,
        total_price: product.price * quantity
      });
      setQrTicket(ticket);
    } catch (error) {
      console.error('Error generando ticket:', error);
      appToast(t('qrErrorGenerating'), 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleCancel = async (ticket: QrTicket) => {
    if (!(await appConfirm(t('qrConfirmCancel')))) return;
    try {
      await cancelQrTicket(ticket.id);
      appToast(t('qrTicketCancelled'), 'success');
    } catch (error) {
      appToast(t('qrErrorCancelling'), 'error');
    }
  };

  const getProduct = (id: string) => qrProducts.find(p => p.id === id);

  const statusBadge = (ticket: QrTicket) => {
    if (ticket.status === 'validated') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="w-3.5 h-3.5" /> {t('qrValidated')}
        </span>
      );
    }
    if (ticket.status === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
          <XCircle className="w-3.5 h-3.5" /> {t('qrCancelled')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        <Clock className="w-3.5 h-3.5" /> {t('qrPending')}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-8">
      {/* Productos activos */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-1 flex items-center gap-2">
          <Beer className="w-5 h-5" style={{ color: '#464971' }} />
          {t('qrBarTitle')}
        </h2>
        <p className="text-sm text-slate-500 mb-4">{t('qrBarSubtitle')}</p>

        {availableProducts.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100">
            <QrCode className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">{t('qrNoProducts')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableProducts.map(product => (
              <div key={product.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800">{product.name}</h3>
                  <span className="font-bold" style={{ color: '#464971' }}>
                    €{product.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="flex items-center border border-slate-200 rounded-lg">
                    <button
                      onClick={() => setQty(product.id, getQty(product.id) - 1)}
                      className="p-2 text-slate-500 hover:text-slate-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{getQty(product.id)}</span>
                    <button
                      onClick={() => setQty(product.id, getQty(product.id) + 1)}
                      className="p-2 text-slate-500 hover:text-slate-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleGenerate(product)}
                    disabled={generating}
                    className="flex-1 flex items-center justify-center gap-2 text-white px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    style={{ backgroundColor: '#464971' }}
                  >
                    <QrCode className="w-4 h-4" />
                    {t('qrGenerate')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historial por días */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">{t('qrMyTickets')}</h2>
        {myTicketsByDay.length === 0 ? (
          <p className="text-slate-500 text-sm">{t('qrNoTickets')}</p>
        ) : (
          <div className="space-y-6">
            {myTicketsByDay.map(([day, tickets]) => (
              <div key={day}>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2 capitalize">
                  {day}
                </h3>
                <div className="space-y-2">
                  {tickets.map(ticket => {
                    const product = getProduct(ticket.product_id);
                    return (
                      <div key={ticket.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div>
                          <p className="font-medium text-slate-800">
                            {ticket.quantity} × {product?.name || t('qrUnknownProduct')}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(ticket.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            {ticket.validated_at && (
                              <> · {t('qrValidatedAt')} {new Date(ticket.validated_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-700">€{ticket.total_price.toFixed(2)}</span>
                          {statusBadge(ticket)}
                          {ticket.status === 'pending' && (
                            <button
                              onClick={() => handleCancel(ticket)}
                              className="text-slate-400 hover:text-red-600"
                              title={t('qrCancelTicket')}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal QR */}
      {qrTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setQrTicket(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-800 mb-1">
              {qrTicket.quantity} × {getProduct(qrTicket.product_id)?.name}
            </h3>
            <p className="text-lg font-semibold mb-4" style={{ color: '#464971' }}>
              €{qrTicket.total_price.toFixed(2)}
            </p>
            <div className="flex justify-center mb-4">
              <QRCodeSVG value={qrTicket.id} size={220} level="M" />
            </div>
            <p className="text-xs text-slate-400 mb-1 font-mono">{qrTicket.id}</p>
            <p className="text-sm text-slate-500 mb-5">{t('qrShowToAdmin')}</p>
            <button
              onClick={() => setQrTicket(null)}
              className="w-full py-2 rounded-lg font-medium text-white"
              style={{ backgroundColor: '#464971' }}
            >
              {t('qrClose')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useSupabase } from '../../lib/SupabaseContext';
import { useAuth } from '../../context/AuthContext';
import { QrProduct, QrTicket } from '../../lib/supabase';
import { Plus, Edit2, Trash2, QrCode, CheckCircle, Clock, Camera, X, Beer, CameraOff } from 'lucide-react';
import { appConfirm, appToast } from '../ui/AppFeedback';
import { Html5Qrcode } from 'html5-qrcode';
import { isProductAvailable } from './BarraUsuario';

const SCANNER_ID = 'qr-scanner-region';

export default function BarraAdmin() {
  const { t } = useTranslation();
  const { realUser } = useAuth();
  const {
    qrProducts, qrTickets, users,
    createQrProduct, updateQrProduct, deleteQrProduct,
    validateQrTicket, cancelQrTicket, getQrTicketById, refreshQrTickets, refreshQrProducts
  } = useSupabase();

  // Respaldo al realtime: mientras esta vista está abierta, refresca cada 5s
  // por si el canal de tiempo real se cae (móvil, cambio de red, etc.)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshQrTickets();
      refreshQrProducts();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const [tab, setTab] = useState<'scan' | 'products' | 'tickets'>('scan');
  const [filterUser, setFilterUser] = useState('');
  const [filterDay, setFilterDay] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<QrProduct | null>(null);
  const [form, setForm] = useState({ name: '', price: '', is_active: false, active_from: '', active_until: '' });

  // Escáner
  const [scanning, setScanning] = useState(false);
  const [scannedTicket, setScannedTicket] = useState<QrTicket | null>(null);
  const [manualId, setManualId] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const pendingTickets = useMemo(
    () => qrTickets.filter(tk => tk.status === 'pending'),
    [qrTickets]
  );

  // Historial admin agrupado por día, con filtros por usuario y fecha
  const filteredTickets = useMemo(
    () => qrTickets.filter(tk => {
      if (filterUser && tk.user_id !== filterUser) return false;
      if (filterDay) {
        const d = new Date(tk.created_at);
        const ticketDay = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (ticketDay !== filterDay) return false;
      }
      return true;
    }),
    [qrTickets, filterUser, filterDay]
  );

  const filteredTotal = useMemo(
    () => filteredTickets
      .filter(tk => tk.status === 'validated')
      .reduce((sum, tk) => sum + tk.total_price, 0),
    [filteredTickets]
  );

  const ticketsByDay = useMemo(() => {
    const groups: { [day: string]: QrTicket[] } = {};
    filteredTickets.forEach(tk => {
      const day = new Date(tk.created_at).toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
      if (!groups[day]) groups[day] = [];
      groups[day].push(tk);
    });
    return Object.entries(groups);
  }, [filteredTickets]);

  // Usuarios que tienen tickets, para el filtro
  const usersWithTickets = useMemo(() => {
    const ids = new Set(qrTickets.map(tk => tk.user_id));
    return users
      .filter(u => ids.has(u.id))
      .sort((a, b) => `${a.name} ${a.surname}`.localeCompare(`${b.name} ${b.surname}`));
  }, [qrTickets, users]);

  const getProduct = (id: string) => qrProducts.find(p => p.id === id);
  const getUser = (id: string) => users.find(u => u.id === id);
  const getValidator = (id?: string | null) => id ? users.find(u => u.id === id) : null;

  // ---------- Escáner ----------

  const stopScanner = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  const lookupTicket = async (rawId: string) => {
    const id = rawId.trim();
    // Primero estado local (rápido); si no, consulta directa a BD por si
    // el realtime aún no ha traído el ticket
    const ticket = qrTickets.find(tk => tk.id === id) || await getQrTicketById(id);
    if (!ticket) {
      appToast(t('qrTicketNotFound'), 'error');
      return;
    }
    setScannedTicket(ticket);
    refreshQrTickets();
  };

  const onScanSuccess = (decoded: string) => {
    stopScanner();
    // Feedback háptico en móviles: el admin siente el escaneo sin mirar
    try { navigator.vibrate?.(150); } catch {}
    lookupTicket(decoded);
  };

  const startScanner = async () => {
    setScanning(true);
    // Esperar a que el div exista en el DOM
    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode(SCANNER_ID);
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          onScanSuccess,
          () => {}
        );
      } catch (err) {
        console.error('Error iniciando cámara:', err);
        appToast(t('qrCameraError'), 'error');
        setScanning(false);
      }
    }, 100);
  };

  const lookupManual = async () => {
    const id = manualId.trim();
    setManualId('');
    await lookupTicket(id);
  };

  const handleValidate = async () => {
    if (!scannedTicket || !realUser?.id) return;
    try {
      await validateQrTicket(scannedTicket.id, realUser.id);
      appToast(t('qrValidatedOk'), 'success');
      setScannedTicket(null);
    } catch (error) {
      appToast(t('qrErrorValidating'), 'error');
    }
  };

  const handleReject = async () => {
    if (!scannedTicket) return;
    if (!(await appConfirm(t('qrConfirmReject')))) return;
    try {
      await cancelQrTicket(scannedTicket.id);
      appToast(t('qrTicketCancelled'), 'success');
      setScannedTicket(null);
    } catch (error) {
      appToast(t('qrErrorCancelling'), 'error');
    }
  };

  // ---------- Productos ----------

  const openForm = (product?: QrProduct) => {
    if (product) {
      setEditing(product);
      setForm({
        name: product.name,
        price: String(product.price),
        is_active: product.is_active,
        active_from: product.active_from ? product.active_from.slice(0, 16) : '',
        active_until: product.active_until ? product.active_until.slice(0, 16) : ''
      });
    } else {
      setEditing(null);
      setForm({ name: '', price: '', is_active: false, active_from: '', active_until: '' });
    }
    setShowForm(true);
  };

  const saveProduct = async () => {
    const price = parseFloat(form.price);
    if (!form.name.trim() || isNaN(price) || price < 0) {
      appToast(t('qrInvalidProduct'), 'error');
      return;
    }
    const payload = {
      name: form.name.trim(),
      price,
      is_active: form.is_active,
      active_from: form.active_from ? new Date(form.active_from).toISOString() : null,
      active_until: form.active_until ? new Date(form.active_until).toISOString() : null
    };
    try {
      if (editing) {
        await updateQrProduct(editing.id, payload);
      } else {
        await createQrProduct(payload as any);
      }
      setShowForm(false);
      appToast(t('qrProductSaved'), 'success');
    } catch (error) {
      appToast(t('qrErrorSavingProduct'), 'error');
    }
  };

  const handleDeleteProduct = async (product: QrProduct) => {
    if (!(await appConfirm(`${t('qrConfirmDeleteProduct')} "${product.name}"?`))) return;
    try {
      await deleteQrProduct(product.id);
      appToast(t('qrProductDeleted'), 'success');
    } catch (error) {
      appToast(t('qrErrorDeletingProduct'), 'error');
    }
  };

  const statusBadge = (ticket: QrTicket) => {
    if (ticket.status === 'validated') {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle className="w-3.5 h-3.5" /> {t('qrValidated')}</span>;
    }
    if (ticket.status === 'cancelled') {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">{t('qrCancelled')}</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><Clock className="w-3.5 h-3.5" /> {t('qrPending')}</span>;
  };

  const tabBtn = (key: typeof tab, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setTab(key)}
      className={`flex-1 py-3 px-4 text-center font-medium transition-colors flex items-center justify-center gap-2 ${
        tab === key
          ? 'text-[#464971] border-b-2 border-[#464971] bg-[#464971]/5'
          : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
      }`}
    >
      {icon}{label}
    </button>
  );

  return (
    <div>
      <div className="flex border-b border-slate-200">
        {tabBtn('scan', `${t('qrScan')} (${pendingTickets.length})`, <Camera className="w-4 h-4" />)}
        {tabBtn('products', t('qrProducts'), <Beer className="w-4 h-4" />)}
        {tabBtn('tickets', t('qrAllTickets'), <Clock className="w-4 h-4" />)}
      </div>

      <div className="p-6">
        {/* ======== TAB: Escanear ======== */}
        {tab === 'scan' && (
          <div className="space-y-6">
            <div className="max-w-md mx-auto">
              {!scanning ? (
                <button
                  onClick={startScanner}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-medium text-white"
                  style={{ backgroundColor: '#464971' }}
                >
                  <Camera className="w-5 h-5" /> {t('qrStartCamera')}
                </button>
              ) : (
                <div className="space-y-3">
                  <div id={SCANNER_ID} className="rounded-xl overflow-hidden bg-black" />
                  <button
                    onClick={stopScanner}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <CameraOff className="w-4 h-4" /> {t('qrStopCamera')}
                  </button>
                </div>
              )}

              {/* Respaldo: pegar ID manualmente */}
              <div className="mt-4 flex gap-2">
                <input
                  value={manualId}
                  onChange={e => setManualId(e.target.value)}
                  placeholder={t('qrManualIdPlaceholder')}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                />
                <button
                  onClick={lookupManual}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                  style={{ backgroundColor: '#464971' }}
                >
                  {t('qrLookup')}
                </button>
              </div>
            </div>

            {/* Ticket escaneado: pantalla de validación */}
            {scannedTicket && (() => {
              const product = getProduct(scannedTicket.product_id);
              const owner = getUser(scannedTicket.user_id);
              const alreadyValidated = scannedTicket.status === 'validated';
              return (
                <div className="max-w-md mx-auto bg-white border-2 rounded-2xl p-6 text-center"
                  style={{ borderColor: alreadyValidated ? '#22c55e' : '#464971' }}>
                  <p className="text-sm text-slate-500 mb-1">{owner ? `${owner.name} ${owner.surname}` : ''}</p>
                  <h3 className="text-2xl font-bold text-slate-800">
                    {scannedTicket.quantity} × {product?.name || t('qrUnknownProduct')}
                  </h3>
                  <p className="text-xl font-semibold my-2" style={{ color: '#464971' }}>
                    €{scannedTicket.total_price.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-400 mb-4">
                    {t('qrGeneratedAt')}: {new Date(scannedTicket.created_at).toLocaleString('es-ES')}
                  </p>

                  {alreadyValidated ? (
                    <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                      <CheckCircle className="w-6 h-6" /> {t('qrAlreadyValidated')}
                    </div>
                  ) : scannedTicket.status === 'cancelled' ? (
                    <div className="text-slate-500 font-medium">{t('qrCancelled')}</div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleValidate}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg text-white bg-green-600 hover:bg-green-700 active:scale-95 transition-transform"
                      >
                        <CheckCircle className="w-6 h-6" /> {t('qrValidate')}
                      </button>
                      <button
                        onClick={handleReject}
                        className="px-5 py-4 rounded-xl font-medium text-red-600 border-2 border-red-200 hover:bg-red-50 active:scale-95 transition-transform"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setScannedTicket(null)}
                    className="mt-3 text-sm text-slate-500 hover:text-slate-700"
                  >
                    {t('qrClose')}
                  </button>
                </div>
              );
            })()}

            {/* Pendientes (respaldo si la cámara falla) */}
            {pendingTickets.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  {t('qrPendingList')} ({pendingTickets.length})
                </h3>
                <div className="space-y-2">
                  {pendingTickets.map(ticket => {
                    const product = getProduct(ticket.product_id);
                    const owner = getUser(ticket.user_id);
                    return (
                      <button
                        key={ticket.id}
                        onClick={() => setScannedTicket(ticket)}
                        className="w-full flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-lg hover:bg-amber-100 text-left"
                      >
                        <div>
                          <p className="font-medium text-slate-800">
                            {ticket.quantity} × {product?.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {owner ? `${owner.name} ${owner.surname}` : ''} · {new Date(ticket.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <span className="font-semibold text-slate-700">€{ticket.total_price.toFixed(2)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======== TAB: Productos ======== */}
        {tab === 'products' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">{t('qrProducts')}</h3>
              <button
                onClick={() => openForm()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: '#464971' }}
              >
                <Plus className="w-4 h-4" /> {t('qrNewProduct')}
              </button>
            </div>

            {qrProducts.length === 0 ? (
              <p className="text-slate-500 text-sm py-8 text-center">{t('qrNoProductsAdmin')}</p>
            ) : (
              <div className="space-y-2">
                {qrProducts.map(product => {
                  const available = isProductAvailable(product);
                  return (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-800">{product.name}</p>
                          {available ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">{t('qrActiveNow')}</span>
                          ) : product.is_active ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{t('qrScheduled')}</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-500">{t('qrInactive')}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          €{product.price.toFixed(2)}
                          {(product.active_from || product.active_until) && (
                            <> · {product.active_from ? new Date(product.active_from).toLocaleString('es-ES') : '—'}
                            {' → '}
                            {product.active_until ? new Date(product.active_until).toLocaleString('es-ES') : '—'}</>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openForm(product)} className="p-2 text-slate-500 hover:text-slate-700 rounded hover:bg-slate-100">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteProduct(product)} className="p-2 text-red-500 hover:text-red-700 rounded hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======== TAB: Todos los tickets ======== */}
        {tab === 'tickets' && (
          <div className="space-y-6">
            {/* Filtros: usuario y día */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">{t('qrFilterUser')}</label>
                <select
                  value={filterUser}
                  onChange={e => setFilterUser(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="">{t('qrAllUsers')}</option>
                  {usersWithTickets.map(u => (
                    <option key={u.id} value={u.id}>{u.name} {u.surname}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">{t('qrFilterDay')}</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filterDay}
                    onChange={e => setFilterDay(e.target.value)}
                    className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white"
                  />
                  <button
                    onClick={() => {
                      const now = new Date();
                      setFilterDay(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
                    }}
                    className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 whitespace-nowrap"
                  >
                    {t('qrToday')}
                  </button>
                </div>
              </div>
            </div>

            {(filterUser || filterDay) && (
              <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-4 py-2">
                <p className="text-sm text-slate-600">
                  {filteredTickets.length} {t('qrAllTickets').toLowerCase()}
                </p>
                <p className="text-sm font-semibold" style={{ color: '#464971' }}>
                  {t('qrFilteredTotal')}: €{filteredTotal.toFixed(2)}
                </p>
              </div>
            )}

            {ticketsByDay.length === 0 ? (
              <p className="text-slate-500 text-sm py-8 text-center">{t('qrNoTickets')}</p>
            ) : ticketsByDay.map(([day, tickets]) => (
              <div key={day}>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2 capitalize">{day}</h3>
                <div className="space-y-2">
                  {tickets.map(ticket => {
                    const product = getProduct(ticket.product_id);
                    const owner = getUser(ticket.user_id);
                    const validator = getValidator(ticket.validated_by);
                    return (
                      <div key={ticket.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                        ticket.status === 'validated' ? 'bg-green-50 border-green-100' :
                        ticket.status === 'cancelled' ? 'bg-slate-50 border-slate-100 opacity-60' :
                        'bg-amber-50 border-amber-100'
                      }`}>
                        <div>
                          <p className="font-medium text-slate-800">
                            {ticket.quantity} × {product?.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {owner ? `${owner.name} ${owner.surname}` : ticket.user_id} ·
                            {' '}{new Date(ticket.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            {ticket.validated_at && (
                              <> · ✓ {new Date(ticket.validated_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                              {validator ? ` (${validator.name})` : ''}</>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-700">€{ticket.total_price.toFixed(2)}</span>
                          {statusBadge(ticket)}
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

      {/* Modal formulario producto */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              {editing ? t('qrEditProduct') : t('qrNewProduct')}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('qrProductName')}</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder={t('qrProductNamePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('qrProductPrice')}</label>
                <input
                  type="number" step="0.01" min="0"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('qrActiveFrom')}</label>
                  <input
                    type="datetime-local"
                    value={form.active_from}
                    onChange={e => setForm({ ...form, active_from: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('qrActiveUntil')}</label>
                  <input
                    type="datetime-local"
                    value={form.active_until}
                    onChange={e => setForm({ ...form, active_until: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded"
                />
                {t('qrActiveNow')}
              </label>
              <p className="text-xs text-slate-500">{t('qrPeriodHelp')}</p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={saveProduct}
                  className="flex-1 py-2 rounded-lg font-medium text-white"
                  style={{ backgroundColor: '#464971' }}
                >
                  {t('qrSave')}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  {t('qrCancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

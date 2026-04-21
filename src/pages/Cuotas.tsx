import React, { useState } from 'react';
import { useSupabase } from '../lib/SupabaseContext';
import { useTranslation } from '../lib/i18n';
import { CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { PaymentFormModal } from '../components/forms/PaymentFormModal';

export default function Cuotas() {
  const { families, users, categories, user, quotas } = useSupabase();
  const { t } = useTranslation();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const isAdmin = user.role === 'admin' || user.role === 'master_admin';
  
  const displayFamilies = isAdmin ? families : families.filter(f => f.id === user.family_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{isAdmin ? t('quotaControl') : t('myQuotas')}</h2>
        {isAdmin && (
          <button 
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center justify-center bg-white text-[rgb(48,80,105)] border-3 border-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)] hover:text-white px-3 py-1.5 rounded-xl font-medium transition-all shadow-sm text-sm"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {t('registerPayment')}
          </button>
        )}
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">{t('totalCollected')}</p>
          <p className="text-3xl font-bold text-slate-600">€2,450</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">{t('pending')}</p>
          <p className="text-3xl font-bold text-slate-500">€450</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">{t('familiesUpToDate')}</p>
          <p className="text-3xl font-bold text-slate-700">45 / 50</p>
        </div>
      </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800">{isAdmin ? t('statusByFamily') : t('myFamilyStatus')}</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {displayFamilies.map(family => {
            // Calculate total quota for family
            let totalQuota = 0;
            family.members.forEach(memberId => {
              const user = users.find(u => u.id === memberId);
              if (user) {
                const cat = categories.find(c => c.id === user.categoryId);
                if (cat) totalQuota += cat.quotaamount;
              }
            });

            // Mock payment status
            const isPaid = family.id === 'f1';

            return (
              <div key={family.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-slate-800">{family.name}</h4>
                  <p className="text-sm text-slate-500">{family.members.length} {t('members')} • {t('totalQuota')}: €{totalQuota}</p>
                </div>
                <div className="flex items-center gap-4">
                  {isPaid ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      {t('upToDate')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                      <AlertCircle className="w-4 h-4 mr-1.5" />
                      {t('pending')}
                    </span>
                  )}
                  {isAdmin && (
                    <button className="text-sm font-medium text-[rgb(48,80,105)] bg-white border-3 border-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)] hover:text-white px-4 py-2 rounded-xl transition-all">
                      {t('viewDetail')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PaymentFormModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} />
    </div>
  );
}

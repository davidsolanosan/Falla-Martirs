import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSupabase } from '../lib/SupabaseContext';
import { useTranslation } from '../lib/i18n';
import { Globe, Lock, Check, Eye, EyeOff, ChevronRight, User as UserIcon, Users, Info, IdCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateInitialPassword, verifyPassword } from '../utils/authUtils';

export default function Configuracion() {
  const { user, changePassword, isImpersonating } = useAuth();
  const { users, families, categories, familyRepresentatives } = useSupabase();
  const { t, language, setLanguage } = useTranslation();

  // Registro completo del censo (AuthContext puede traer menos campos)
  const fullUser = users.find(u => u.id === user?.id);
  const myFamily = families.find(f => f.id === fullUser?.family_id);
  const familyMembers = myFamily ? users.filter(u => u.family_id === myFamily.id) : [];
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Miembro cuyos datos personales se muestran: el seleccionado o el propio usuario
  const selectedMember = (selectedMemberId
    ? familyMembers.find(m => m.id === selectedMemberId)
    : null) || fullUser;
  const selectedCategory = categories.find(c => c.id === selectedMember?.category_id);

  const representatives = myFamily
    ? familyRepresentatives
        .filter(r => r.family_id === myFamily.id)
        .map(r => users.find(u => u.id === r.user_id))
        .filter(Boolean)
    : [];

  const sexLabel = (s?: string) =>
    s === 'M' ? t('male') : s === 'F' ? t('female') : s || '—';

  const Row = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-slate-800 text-right">{value || '—'}</span>
    </div>
  );
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const showError = (msg: string, ms = 4000) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), ms);
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleLanguageChange = (newLanguage: 'es' | 'va') => {
    setLanguage(newLanguage);
    showSuccess(t('languageChanged'));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showError(t('fillAllFields'));
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError(t('passwordsDoNotMatch'));
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showError(t('passwordTooShort'));
      return;
    }
    if (passwordData.newPassword === passwordData.currentPassword) {
      showError(t('passwordMustBeDifferent'));
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Verificar la contraseña actual
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', user?.id)
        .single();

      if (fetchError || !userData) {
        showError(t('errorChangingPassword'));
        return;
      }

      const isCurrentValid = userData.password_hash
        ? await verifyPassword(passwordData.currentPassword, userData.password_hash)
        : passwordData.currentPassword === generateInitialPassword(user?.dni || '', user?.birth_year || '');

      if (!isCurrentValid) {
        showError(t('currentPasswordIncorrect'));
        return;
      }

      // Cambiar la contraseña usando el contexto de auth
      const result = await changePassword(user!.id, passwordData.newPassword);

      if (!result.success) {
        showError(result.error || t('errorChangingPassword'));
        return;
      }

      showSuccess(t('passwordChanged'));
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    } catch (error) {
      showError(t('errorChangingPassword'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{t('settings')}</h2>
        <p className="text-slate-500 mt-1">{t('userSettingsDescription')}</p>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center">
          <Check className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {errorMessage}
        </div>
      )}

      {/* Mis datos de censo (solo lectura) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center">
          <IdCard className="w-5 h-5 mr-2 text-indigo-600" />
          {t('myCensusData')}
        </h3>

        {/* Unidad familiar */}
        {myFamily && (
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4" /> {t('familyUnit')}
            </p>
            <div className="bg-slate-50 rounded-xl px-4">
              <Row label={t('family')} value={myFamily.name} />
              <Row label={t('address')} value={myFamily.address} />
              <Row label={t('phone')} value={myFamily.phone} />
              {representatives.length > 0 && (
                <Row
                  label={t('representative')}
                  value={representatives.map((r: any) => `${r.name} ${r.surname}`).join(', ')}
                />
              )}
            </div>

            {/* Miembros de la familia — pulsables para ver sus datos */}
            <div className="mt-3 space-y-2">
              {familyMembers.map(member => {
                const memberCategory = categories.find(c => c.id === member.category_id);
                const isMe = member.id === user?.id;
                const isSelected = member.id === selectedMember?.id;
                return (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMemberId(member.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300'
                        : 'bg-white border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-slate-800 text-sm">
                        {member.name} {member.surname}
                        {isMe && (
                          <span className="ml-2 text-xs font-semibold text-indigo-600">({t('youTag')})</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {memberCategory?.name || '—'} · {member.birth_year || '—'}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-indigo-500 rotate-90' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Datos personales del miembro seleccionado (o del propio usuario) */}
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <UserIcon className="w-4 h-4" /> {t('personalData')}
            {selectedMember && selectedMember.id !== user?.id && (
              <span className="normal-case font-medium text-slate-400">
                — {selectedMember.name} {selectedMember.surname}
              </span>
            )}
          </p>
          <div className="bg-slate-50 rounded-xl px-4">
            <Row label={t('name')} value={selectedMember ? `${selectedMember.name} ${selectedMember.surname}` : user?.name} />
            <Row label={t('dni')} value={selectedMember?.dni} />
            <Row label={t('birthDate')} value={selectedMember?.birth_year} />
            <Row label={t('sex')} value={sexLabel(selectedMember?.sexo)} />
            <Row label={t('category')} value={selectedCategory?.name} />
            <Row label={t('censusNumber')} value={selectedMember?.numero_censo} />
            <Row label={t('email')} value={selectedMember?.email || user?.email} />
            <Row label={t('phone')} value={selectedMember?.phone || selectedMember?.telefon_tutor} />
            {selectedMember?.cargo && <Row label={t('position')} value={selectedMember.cargo} />}
            {selectedMember?.tutor && <Row label={t('legalTutor')} value={selectedMember.tutor} />}
            {selectedMember?.tutor && <Row label={t('tutorPhone')} value={selectedMember.telefon_tutor} />}
          </div>
        </div>

        {/* Aviso solo lectura */}
        <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl p-3">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{t('censusDataNotice')}</p>
        </div>
      </div>

      {/* Language Selection */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2 text-indigo-600" />
          {t('language')}
        </h3>
        <div className="space-y-3">
          <button
            onClick={() => handleLanguageChange('va')}
            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${
              language === 'va'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 mr-3 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                VA
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-800">Valencià</p>
                <p className="text-sm text-slate-500">Valenciano</p>
              </div>
            </div>
            {language === 'va' && <Check className="w-5 h-5 text-indigo-600" />}
          </button>

          <button
            onClick={() => handleLanguageChange('es')}
            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${
              language === 'es'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 mr-3 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-sm">
                ES
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-800">Español</p>
                <p className="text-sm text-slate-500">Castellano</p>
              </div>
            </div>
            {language === 'es' && <Check className="w-5 h-5 text-indigo-600" />}
          </button>
        </div>
      </div>

      {/* Password Change — oculto mientras se actúa como otro usuario */}
      {!isImpersonating && (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Lock className="w-5 h-5 mr-2 text-indigo-600" />
          {t('security')}
        </h3>

        {!isChangingPassword ? (
          <button
            onClick={() => setIsChangingPassword(true)}
            className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center">
              <Lock className="w-5 h-5 text-slate-600 mr-3" />
              <span className="font-medium text-slate-800">{t('changePassword')}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('currentPassword')}
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={t('enterCurrentPassword')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('newPassword')}
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={t('enterNewPassword')}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('confirmPassword')}
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={t('confirmNewPassword')}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? t('updating') : t('updatePassword')}
              </button>
            </div>
          </form>
        )}
      </div>
      )}
    </div>
  );
}

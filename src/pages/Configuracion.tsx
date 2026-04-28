import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../lib/i18n';
import { Settings, Globe, Lock, Smartphone, Check, Eye, EyeOff, ChevronRight, User, Mail, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Configuracion() {
  const { user, signOut } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');
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

  const handleLanguageChange = (newLanguage: 'es' | 'va') => {
    try {
      setLanguage(newLanguage);
      setSuccessMessage(t('languageChanged'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(t('errorChangingLanguage'));
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage(t('passwordsDoNotMatch'));
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMessage(t('passwordTooShort'));
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Verificar contraseña actual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: passwordData.currentPassword
      });

      if (signInError) {
        setErrorMessage(t('currentPasswordIncorrect'));
        setIsLoading(false);
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }

      // Actualizar contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) {
        setErrorMessage(t('errorUpdatingPassword'));
        setTimeout(() => setErrorMessage(''), 3000);
      } else {
        setSuccessMessage(t('passwordChanged'));
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setIsChangingPassword(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      setErrorMessage(t('errorUpdatingPassword'));
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{t('settings')}</h2>
          <p className="text-slate-500 mt-1">{t('userSettingsDescription')}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl font-medium transition-colors text-sm"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t('signOut')}
        </button>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {user?.name?.charAt(0)}{user?.surname?.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-800">
              {user?.name} {user?.surname}
            </h3>
            <div className="flex items-center text-sm text-slate-500 mt-1">
              <Mail className="w-4 h-4 mr-1" />
              {user?.email}
            </div>
            <div className="flex items-center text-sm text-slate-500 mt-1">
              <User className="w-4 h-4 mr-1" />
              {t('role')}: {user?.role === 'master_admin' ? t('masterAdmin') : t('user')}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 max-w-md">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'general' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4 mr-2" />
          {t('general')}
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'security' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Lock className="w-4 h-4 mr-2" />
          {t('security')}
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center">
          <Check className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          {errorMessage}
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {activeTab === 'general' ? (
          <div className="p-6 space-y-6">
            {/* Language Selection */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-indigo-600" />
                {t('language')}
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleLanguageChange('es')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${
                    language === 'es' 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🇪🇸</span>
                    <div className="text-left">
                      <p className="font-medium text-slate-800">Español</p>
                      <p className="text-sm text-slate-500">Castellano</p>
                    </div>
                  </div>
                  {language === 'es' && (
                    <Check className="w-5 h-5 text-indigo-600" />
                  )}
                </button>

                <button
                  onClick={() => handleLanguageChange('va')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${
                    language === 'va' 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">�</span>
                    <div className="text-left">
                      <p className="font-medium text-slate-800">Valencià</p>
                      <p className="text-sm text-slate-500">Valenciano</p>
                    </div>
                  </div>
                  {language === 'va' && (
                    <Check className="w-5 h-5 text-indigo-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start">
                <Smartphone className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">{t('mobileOptimized')}</h4>
                  <p className="text-sm text-blue-700">
                    {t('mobileOptimizedDescription')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Password Change */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-indigo-600" />
                {t('changePassword')}
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
          </div>
        )}
      </div>
    </div>
  );
}

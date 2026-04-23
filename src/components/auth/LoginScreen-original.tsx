import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, Key, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../lib/i18n';

export function LoginScreen() {
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true); // Inicia el desvanecimiento
      setTimeout(() => {
        setShowLogin(true); // Muestra el login después del fade
      }, 300); // 300ms para el fade out
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || t('loginError'));
      }
    } catch (err) {
      setError(t('loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await resetPassword(email);
      
      if (result.success) {
        setInfo(t('resetEmailSent'));
        setShowReset(false);
      } else {
        setError(result.error || t('resetError'));
      }
    } catch (err) {
      setError(t('resetError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      {/* Logo y Fade In */}
      <div className={`absolute top-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-1000 ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Falla Màrtirs</h1>
            <p className="text-sm text-slate-600">Accés exclusiu per a fallers</p>
          </div>
        </div>
      </div>

      {/* Contenedor del Login */}
      <div className={`w-full max-w-md transition-all duration-700 transform ${showLogin ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {showReset ? t('resetPassword') : t('login')}
            </h2>
            <p className="text-slate-600">
              {showReset ? t('resetPasswordDesc') : t('loginDesc')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {info && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-green-800 text-sm">{info}</p>
            </div>
          )}

          {!showReset ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
                    placeholder={t('emailPlaceholder')}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
                    placeholder={t('passwordPlaceholder')}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-medium py-3 px-4 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('loggingIn')}</span>
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    <span>{t('login')}</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
                    placeholder={t('emailPlaceholder')}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-medium py-3 px-4 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('sending')}</span>
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    <span>{t('sendResetEmail')}</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setShowReset(!showReset);
                setError('');
                setInfo('');
              }}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors"
            >
              {showReset ? t('backToLogin') : t('forgotPassword')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

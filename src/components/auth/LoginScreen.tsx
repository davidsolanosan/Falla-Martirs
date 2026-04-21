import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

  if (!showLogin) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
        <div className={`w-32 h-32 flex items-center justify-center ${fadeOut ? 'scale-95' : 'scale-100'} transition-all duration-300`}>
          <img 
            src="/logo-blaus.jpg" 
            alt={t('appTitle')} 
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
        <h1 className={`text-3xl font-bold text-[rgb(48,80,105)] mt-6 text-center ${fadeOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} transition-all duration-300`}>
          {t('appTitle')}
        </h1>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        if (result.requiresPasswordChange) {
          setInfo('Debes cambiar tu contraseña inicial. Redirigiendo...');
          setTimeout(() => {
            navigate('/change-password');
          }, 2000);
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError('Ocurrió un error. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setIsLoading(true);
    
    try {
      const result = await resetPassword(email);
      
      if (result.success) {
        setInfo('Se ha enviado un email con instrucciones para resetear tu contraseña.');
        setShowReset(false);
      } else {
        setError(result.error || 'Error al resetear contraseña');
      }
    } catch (err: any) {
      console.error("Reset error:", err);
      setError('Ocurrió un error. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-md w-full animate-fade-in">
        <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <img 
            src="/logo-blaus.jpg" 
            alt="Falla Martirs" 
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">{t('appTitle')}</h1>
        <p className="text-slate-500 mb-8 text-center">
          {showReset ? t('resetPasswordTitle') : t('loginSubtitle')}
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {info && (
          <div className="mb-6 p-3 bg-green-50 border border-green-100 rounded-xl flex items-start text-green-600 text-sm">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{info}</span>
          </div>
        )}

        {!showReset ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('email')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 bg-slate-50"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('password')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 bg-slate-50"
                    placeholder=""
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center bg-white text-[rgb(48,80,105)] border-3 border-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)] hover:text-white px-3 py-1.5 rounded-xl font-medium transition-all shadow-sm text-sm disabled:opacity-50"
              >
                {isLoading ? 'Cargando...' : t('loginButton')}
              </button>
            </form>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => setShowReset(true)}
                className="text-sm text-slate-600 hover:text-slate-800"
              >
                {t('forgotPassword')}
              </button>
            </div>

          </>
        ) : (
          <>
            <form onSubmit={handleResetPassword} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 bg-slate-50"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center bg-white text-[rgb(48,80,105)] border-3 border-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)] hover:text-white px-3 py-1.5 rounded-xl font-medium transition-all shadow-sm text-sm disabled:opacity-50"
              >
                {isLoading ? 'Enviando...' : 'Enviar Email de Reset'}
              </button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowReset(false)}
                className="text-sm text-slate-600 hover:text-slate-800"
              >
                {t('backToLogin')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

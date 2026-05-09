import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useSupabase } from '../../lib/SupabaseContext';
import { validatePasswordStrength } from '../../utils/authUtils';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const { loginUser, changePassword } = useSupabase();
  const [step, setStep] = useState<'login' | 'change-password'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await loginUser(formData.email, formData.password);
      
      if (result.isFirstLogin) {
        setCurrentUser(result.user);
        setStep('change-password');
        setSuccess('¡Bienvenido! Es tu primer login. Debes cambiar tu contraseña.');
      } else {
        onSuccess(result.user);
        onClose();
        setSuccess('¡Login correcto!');
      }
    } catch (err: any) {
      setError(err.message || 'Error en el login');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validar contraseña
      const validation = validatePasswordStrength(formData.newPassword);
      if (!validation.isValid) {
        setError(validation.errors.join('. '));
        return;
      }

      // Validar que coincidan
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }

      await changePassword(currentUser.id, formData.newPassword);
      
      setSuccess('¡Contraseña cambiada correctamente!');
      
      // Esperar un momento y redirigir
      setTimeout(() => {
        onSuccess(currentUser);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error cambiando la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    const validation = validatePasswordStrength(password);
    if (password.length === 0) return { text: '', color: '' };
    if (validation.isValid) return { text: 'Fuerte', color: 'text-green-600' };
    return { text: 'Débil', color: 'text-red-600' };
  };

  const strength = getPasswordStrength(formData.newPassword);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Login de Falleros" maxWidth="max-w-md">
      {step === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="DNI + año de nacimiento"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2.5 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Usa tu DNI seguido del año de nacimiento (ej: 12345678A1990)
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              <strong>Es tu primer login:</strong> Por seguridad, debes cambiar tu contraseña antes de continuar.
            </p>
          </div>

          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nueva contraseña segura"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2 top-2.5 text-slate-500 hover:text-slate-700"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {formData.newPassword && (
              <div className="mt-1">
                <span className={`text-xs ${strength.color}`}>
                  Fortaleza: {strength.text}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Repite la nueva contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-2.5 text-slate-500 hover:text-slate-700"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-600 font-medium mb-2">Requisitos de contraseña:</p>
            <ul className="text-xs text-slate-600 space-y-1">
              <li className="flex items-center">
                <span className={`mr-2 ${formData.newPassword.length >= 8 ? 'text-green-600' : 'text-slate-400'}`}>✓</span>
                Al menos 8 caracteres
              </li>
              <li className="flex items-center">
                <span className={`mr-2 ${/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-slate-400'}`}>✓</span>
                Una mayúscula
              </li>
              <li className="flex items-center">
                <span className={`mr-2 ${/[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-slate-400'}`}>✓</span>
                Una minúscula
              </li>
              <li className="flex items-center">
                <span className={`mr-2 ${/[0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-slate-400'}`}>✓</span>
                Un número
              </li>
              <li className="flex items-center">
                <span className={`mr-2 ${/[!@#$%^&*]/.test(formData.newPassword) ? 'text-green-600' : 'text-slate-400'}`}>✓</span>
                Un carácter especial (!@#$%^&*)
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !validatePasswordStrength(formData.newPassword).isValid || formData.newPassword !== formData.confirmPassword}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Cambiando contraseña...' : 'Cambiar contraseña y continuar'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

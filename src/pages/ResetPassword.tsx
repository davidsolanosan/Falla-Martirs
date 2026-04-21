import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { hashPassword, validatePassword } from '../lib/auth';

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      setError('Token de reset no proporcionado');
      setIsTokenValid(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, password_reset_expires')
        .eq('password_reset_token', token)
        .single();

      if (error || !data) {
        setError('Token de reset inválido');
        setIsTokenValid(false);
        return;
      }

      // Verificar si el token ha expirado
      if (data.password_reset_expires && new Date(data.password_reset_expires) < new Date()) {
        setError('El token de reset ha expirado');
        setIsTokenValid(false);
        return;
      }

      setIsTokenValid(true);
    } catch (err) {
      console.error('Error validando token:', err);
      setError('Error al validar token');
      setIsTokenValid(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      setIsLoading(false);
      return;
    }

    // Validar requisitos de contraseña
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setError(validation.errors.join('. '));
      setIsLoading(false);
      return;
    }

    try {
      if (!token) {
        throw new Error('Token no proporcionado');
      }

      // Encriptar nueva contraseña
      const passwordHash = await hashPassword(newPassword);

      // Actualizar usuario
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: passwordHash,
          has_temp_password: false,
          password_reset_token: null,
          password_reset_expires: null
        })
        .eq('password_reset_token', token);

      if (updateError) {
        throw new Error(`Error actualizando contraseña: ${updateError.message}`);
      }

      setSuccess('¡Contraseña reseteada correctamente! Redirigiendo al login...');
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.message || 'Ocurrió un error. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, color: 'bg-gray-200', text: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
    const texts = ['', 'Muy débil', 'Débil', 'Media', 'Fuerte', 'Muy fuerte'];

    return {
      strength,
      color: colors[strength] || 'bg-gray-200',
      text: texts[strength] || ''
    };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  if (isTokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  if (isTokenValid === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Token Inválido</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center bg-white text-[rgb(48,80,105)] border-3 border-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)] hover:text-white px-3 py-1.5 rounded-xl font-medium transition-all shadow-sm text-sm"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-md w-full">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">Resetear Contraseña</h1>
        <p className="text-slate-500 mb-8 text-center">
          Ingresa tu nueva contraseña
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 bg-green-50 border border-green-100 rounded-xl flex items-start text-green-600 text-sm">
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 bg-slate-50"
                placeholder="Nueva contraseña"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5 text-slate-400" />
                ) : (
                  <Eye className="h-5 w-5 text-slate-400" />
                )}
              </button>
            </div>
            
            {/* Indicador de fuerza de contraseña */}
            {newPassword.length > 0 && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-500">Fuerza de la contraseña</span>
                  <span className="text-xs text-slate-600 font-medium">{passwordStrength.text}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Nueva Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 bg-slate-50"
                placeholder="Confirma tu nueva contraseña"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-slate-400" />
                ) : (
                  <Eye className="h-5 w-5 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center bg-white text-[rgb(48,80,105)] border-3 border-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)] hover:text-white px-3 py-1.5 rounded-xl font-medium transition-all shadow-sm text-sm disabled:opacity-50"
          >
            {isLoading ? 'Reseteando...' : 'Resetear Contraseña'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <h3 className="font-medium text-blue-900 mb-2 text-sm">Requisitos de contraseña:</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>
              {newPassword.length >= 8 ? 'X' : 'O'} Al menos 8 caracteres
            </li>
            <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>
              {/[A-Z]/.test(newPassword) ? 'X' : 'O'} Una mayúscula
            </li>
            <li className={/[a-z]/.test(newPassword) ? 'text-green-600' : ''}>
              {/[a-z]/.test(newPassword) ? 'X' : 'O'} Una minúscula
            </li>
            <li className={/[0-9]/.test(newPassword) ? 'text-green-600' : ''}>
              {/[0-9]/.test(newPassword) ? 'X' : 'O'} Un número
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

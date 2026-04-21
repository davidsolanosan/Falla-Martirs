import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  hashPassword, 
  generateResetToken, 
  validatePassword
} from '../lib/auth';
import { hasPermission, canAccessRoute, Role } from '../lib/permissions';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  surname?: string;
  role?: Role;
  has_temp_password?: boolean;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  hasPermission: (permission: string) => boolean;
  canAccessRoute: (route: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);

  // Escuchar cambios de autenticación - versión funcional
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('AuthStateChange:', { event: _event, session: session?.user?.email });
      
      if (session?.user) {
        // Obtener datos del usuario
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .single();
        
        if (data && !error) {
          setUser({
            id: data.id,
            email: data.email,
            name: data.name,
            surname: data.surname,
            role: data.role as Role,
            has_temp_password: data.has_temp_password
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      console.log('Intentando login con email:', email);
      
      // Obtener datos del usuario
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        console.error('Usuario no encontrado:', userError);
        return { success: false, error: 'Usuario no encontrado' };
      }

      // Verificar contraseña
      if (email === 'newalfree@gmail.com' && password === 'SUPER123A1980') {
        // Bypass para superusuario
        console.log('✅ Acceso superusuario');
      } else if (password !== userData.password_hash) {
        console.error('Contraseña incorrecta');
        return { success: false, error: 'Contraseña incorrecta' };
      }

      // Establecer usuario en el contexto
      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        surname: userData.surname,
        role: userData.role as Role,
        has_temp_password: userData.has_temp_password
      });

      console.log('✅ Login exitoso:', userData.email);
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Error al iniciar sesión' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log('🚪 Iniciando función logout...');
    
    try {
      // Logout simple y directo
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      
      // Intentar logout de Supabase con timeout
      try {
        const promise = supabase.auth.signOut();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout en logout')), 3000)
        );
        
        await Promise.race([promise, timeoutPromise]);
        console.log('✅ Logout de Supabase Auth exitoso');
      } catch (authError) {
        console.error('❌ Error en logout de Supabase Auth:', authError);
        // Continuar aunque falle el logout de Supabase
      }
      
      console.log('✅ Logout completado');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error general en logout:', error);
      return { success: false, error: error.message || 'Error al cerrar sesión' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) {
      return { success: false, error: 'No hay sesión activa' };
    }

    try {
      // Validar nueva contraseña
      const validation = validatePassword(newPassword);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join('. ') };
      }

      // Obtener usuario para verificar contraseña actual
      const { data: userData, error } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', user.id)
        .single();

      if (error || !userData) {
        return { success: false, error: 'Error al obtener datos del usuario' };
      }

      // Verificar contraseña actual
      const isValidCurrentPassword = currentPassword === userData.password_hash; // Simple comparación
      
      if (!isValidCurrentPassword) {
        return { success: false, error: 'Contraseña actual incorrecta' };
      }

      // Encriptar nueva contraseña
      const newPasswordHash = await hashPassword(newPassword);

      // Actualizar contraseña
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password_hash: newPasswordHash,
          has_temp_password: false 
        })
        .eq('id', user.id);

      if (updateError) {
        return { success: false, error: 'Error al actualizar contraseña' };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Change password error:', error);
      return { success: false, error: error.message || 'Error al cambiar contraseña' };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Obtener usuario - SOLO CAMPOS DE USERS
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !userData) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      // Generar token de reset
      const resetToken = generateResetToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

      // Actualizar usuario con token
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password_reset_token: resetToken,
          password_reset_expires: expiresAt.toISOString() 
        })
        .eq('id', userData.id);

      if (updateError) {
        return { success: false, error: 'Error al generar token de reset' };
      }

      // TODO: Enviar email con el token
      console.log('Token de reset generado:', resetToken);
      
      return { 
        success: true, 
        message: 'Se ha enviado un email con instrucciones para resetear tu contraseña' 
      };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message || 'Error al resetear contraseña' };
    }
  };

  const checkPermission = (permission: string) => {
    return hasPermission(user?.role, permission as any);
  };

  const checkRouteAccess = (route: string) => {
    return canAccessRoute(user?.role, route);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    changePassword,
    resetPassword,
    hasPermission: checkPermission,
    canAccessRoute: checkRouteAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

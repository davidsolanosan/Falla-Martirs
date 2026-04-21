import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  hashPassword, 
  verifyPassword, 
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

  // Verificar sesión al cargar
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Obtener datos adicionales del usuario
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userData && !error) {
            console.log('Usuario encontrado en checkSession:', userData);
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.name,
              surname: userData.surname,
              role: userData.role as Role,
              has_temp_password: userData.has_temp_password
            });
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Obtener datos adicionales del usuario
        supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: userData }) => {
            if (userData) {
              console.log('Usuario encontrado en onAuthStateChange:', userData);
              setUser({
                id: userData.id,
                email: userData.email,
                name: userData.name,
                surname: userData.surname,
                role: userData.role as Role,
                has_temp_password: userData.has_temp_password
              });
            }
          });
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
      
      // Obtener el usuario para verificar contraseña y rol
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      console.log('Resultado de búsqueda de usuario:', { userData, userError });

      if (userError || !userData) {
        console.error('Usuario no encontrado:', userError);
        return { success: false, error: 'Usuario no encontrado' };
      }

      // Verificar si tiene rol asignado
      if (!userData.role) {
        console.error('Usuario sin rol:', userData);
        return { success: false, error: 'Usuario sin rol asignado' };
      }

      console.log('Rol del usuario:', userData.role);

      // Verificar si tiene contraseña
      if (!userData.password_hash) {
        console.error('Usuario sin contraseña:', userData);
        return { success: false, error: 'Usuario sin contraseña configurada' };
      }

      // Verificar contraseña
      const isValidPassword = await verifyPassword(password, userData.password_hash);
      console.log('Contraseña válida:', isValidPassword);
      
      if (!isValidPassword) {
        return { success: false, error: 'Contraseña incorrecta' };
      }

      // Login con Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Error en Supabase Auth:', error);
        return { success: false, error: error.message };
      }

      console.log('Login exitoso con Supabase Auth:', data);

      // Actualizar último login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userData.id);

      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        surname: userData.surname,
        role: userData.role as Role,
        has_temp_password: userData.has_temp_password
      });

      console.log('Usuario establecido en contexto:', {
        id: userData.id,
        email: userData.email,
        role: userData.role
      });

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Error al iniciar sesión' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
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
      const isValidCurrentPassword = await verifyPassword(currentPassword, userData.password_hash);
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
      // Obtener usuario
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

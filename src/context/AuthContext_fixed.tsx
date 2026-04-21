import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  hashPassword, 
  verifyPassword, 
  generateResetToken, 
  validatePassword,
  hasLoginPermission 
} from '../lib/auth';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  surname?: string;
  role?: string;
  has_temp_password?: boolean;
  category_name?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
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
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.name,
              surname: userData.surname,
              role: userData.role,
              has_temp_password: userData.has_temp_password,
              category_name: userData.category_name
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
              setUser({
                id: userData.id,
                email: userData.email,
                name: userData.name,
                surname: userData.surname,
                role: userData.role,
                has_temp_password: userData.has_temp_password,
                category_name: userData.category_name
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
      // Primero obtener el usuario para verificar categoría y contraseña
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          categories(name)
        `)
        .eq('email', email)
        .single();

      if (userError || !userData) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      // Verificar si tiene permiso de login según categoría
      // Los master_admin siempre tienen acceso
      if (userData.role !== 'master_admin' && !hasLoginPermission(userData.categories?.name || '')) {
        return { success: false, error: 'Tu categoría no tiene permiso de acceso al portal' };
      }

      // Verificar si tiene contraseña
      if (!userData.password_hash) {
        return { success: false, error: 'Usuario sin contraseña configurada' };
      }

      // Verificar contraseña
      const isValidPassword = await verifyPassword(password, userData.password_hash);
      if (!isValidPassword) {
        return { success: false, error: 'Contraseña incorrecta' };
      }

      // Login con Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

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
        role: userData.role,
        has_temp_password: userData.has_temp_password,
        category_name: userData.categories?.name
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

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    changePassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Role } from '../lib/supabase';
import { generateInitialPassword, verifyPassword, hashPassword } from '../utils/authUtils';
import { 
  generateResetToken, 
  validatePassword
} from '../lib/auth';
import { hasPermission, canAccessRoute } from '../lib/permissions';

export interface AuthUser {
  id: string;
  authId?: string; // ID de autenticación de Supabase (auth.users)
  email: string;
  name: string;
  surname?: string;
  role?: Role;
  has_temp_password?: boolean;
  first_login?: boolean;
  dni?: string;
  birth_year?: string;
  family_id?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: AuthUser; isFirstLogin?: boolean }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  changePassword: (userId: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  hasPermission: (permission: string) => boolean;
  canAccessRoute: (route: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Obtener datos del usuario desde la tabla users
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error loading user data:', error);
            return;
          }

          if (userData) {
            setUser({
              id: userData.id,
              authId: session.user.id, // ID de autenticación de Supabase
              email: userData.email,
              name: userData.name,
              surname: userData.surname,
              role: userData.role as Role,
              has_temp_password: userData.has_temp_password,
              first_login: userData.first_login,
              dni: userData.dni,
              birth_year: userData.birth_year
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

    // Listen for auth changes - DESHABILITADO para evitar conflictos con autenticación personal
    // const { data: { subscription } } = supabase.auth.onAuthStateChange(
    //   async (event, session) => {
    //     console.log('Auth state changed:', event, session);
    //
    //     if (event === 'SIGNED_IN' && session?.user) {
    //       try {
    //         // Obtener datos del usuario desde la tabla users
    //         const { data: userData, error } = await supabase
    //           .from('users')
    //           .select('*')
    //           .eq('id', session.user.id)
    //           .single();
    //
    //         if (error) {
    //           console.error('Error loading user data:', error);
    //           return;
    //         }
    //
    //         if (userData) {
    //           setUser({
    //             id: userData.id,
    //             authId: session.user.id, // ID de autenticación de Supabase
    //             email: userData.email,
    //             name: userData.name,
    //             surname: userData.surname,
    //             role: userData.role as Role,
    //             has_temp_password: userData.has_temp_password,
    //             first_login: userData.first_login,
    //             dni: userData.dni,
    //             birth_year: userData.birth_year,
    //             family_id: userData.family_id
    //           });
    //         }
    //       } catch (error) {
    //         console.error('Error in SIGNED_IN handler:', error);
    //       }
    //     } else if (event === 'SIGNED_OUT') {
    //       setUser(null);
    //     }
    //   }
    // );

    // return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      console.log('Intentando login con email:', email);
      
      // Obtener datos del usuario
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (userError || !userData) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      // Verificar contraseña
      if (email === 'newalfree@gmail.com' && password === 'SUPER123A1980') {
        // Bypass para superusuario
        console.log('✅ Acceso superusuario');
      } else {
        // Generar contraseña esperada
        const expectedPassword = generateInitialPassword(userData.dni || '', userData.birth_year || '');
        console.log('Contraseña esperada:', expectedPassword);
        console.log('Contraseña introducida:', password);
        
        // Verificar si tiene password_hash (ya cambió contraseña)
        if (userData.password_hash) {
          console.log('Usuario tiene password_hash, verificando con bcrypt...');
          // Usar contraseña hasheada
          const isValidPassword = await verifyPassword(password, userData.password_hash);
          if (!isValidPassword) {
            console.error('Contraseña hasheada incorrecta');
            return { success: false, error: 'Contraseña incorrecta' };
          }
          console.log('✅ Contraseña hasheada verificada');
        } else {
          console.log('Usuario sin password_hash, usando contraseña inicial...');
          // Usar contraseña inicial (DNI + año)
          if (password !== expectedPassword) {
            console.error('Contraseña inicial incorrecta');
            return { success: false, error: 'Contraseña incorrecta. Use: DNI + año de nacimiento' };
          }
          console.log('✅ Contraseña inicial verificada');
        }
      }

      // Establecer usuario en el contexto
      const authUser = {
        id: userData.id,
        authId: userData.id, // Por ahora usar el mismo ID (se actualizará con la sesión)
        email: userData.email,
        name: userData.name,
        surname: userData.surname,
        role: userData.role as Role,
        has_temp_password: userData.has_temp_password,
        first_login: userData.first_login,
        dni: userData.dni,
        birth_year: userData.birth_year,
        family_id: userData.family_id
      };

      setUser(authUser);

      console.log('✅ Login exitoso:', userData.email);
      console.log('¿Es primer login?', userData.first_login);
      
      return { 
        success: true, 
        user: authUser,
        isFirstLogin: userData.first_login === true
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Error al iniciar sesión' };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (userId: string, newPassword: string) => {
    setLoading(true);
    
    try {
      console.log('Cambiando contraseña para usuario:', userId);
      
      // Hashear nueva contraseña
      const passwordHash = await hashPassword(newPassword);
      
      // Actualizar usuario
      const { error } = await supabase
        .from('users')
        .update({
          password_hash: passwordHash,
          first_login: false,
          password_changed_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      
      console.log('✅ Contraseña cambiada correctamente');
      
      // Actualizar usuario en el contexto si es el usuario actual
      if (user && user.id === userId) {
        setUser({
          ...user,
          first_login: false,
          has_temp_password: false
        });
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error cambiando contraseña:', error);
      return { success: false, error: error.message || 'Error cambiando contraseña' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log('🚪 Iniciando función logout...');
    setLoading(true);
    
    try {
      await supabase.auth.signOut();
      setUser(null);
      console.log('✅ Sesión cerrada exitosamente');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error en logout de Supabase Auth:', error);
      // Continuar aunque falle el logout de Supabase
      setUser(null);
      console.log('✅ Logout completado (forzado)');
      return { success: true };
    } finally {
      setLoading(false);
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
        return { success: false, error: 'Error generando token de reset' };
      }

      // TODO: Enviar email con token (implementar servicio de email)
      console.log('Token de reset generado:', resetToken);

      return { success: true };
    } catch (error: any) {
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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

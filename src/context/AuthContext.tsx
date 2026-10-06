import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../lib/supabase';
import { Role } from '../lib/permissions';
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
  realUser: AuthUser | null;
  isImpersonating: boolean;
  startImpersonation: (user: AuthUser) => void;
  stopImpersonation: () => void;
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
  const [impersonatedUser, setImpersonatedUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const toAuthUser = (userData: any): AuthUser => ({
    id: userData.id,
    authId: userData.id,
    email: userData.email,
    name: userData.name,
    surname: userData.surname,
    role: userData.role as Role,
    has_temp_password: userData.has_temp_password,
    first_login: userData.first_login,
    dni: userData.dni,
    birth_year: userData.birth_year,
    family_id: userData.family_id
  });

  // Restaurar sesión al cargar (auth custom sobre tabla users → persistimos en localStorage)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedUserId = localStorage.getItem('falla_session_user');
        if (!savedUserId) return;

        // Revalidar contra la BD por si el usuario fue eliminado o cambió
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', savedUserId)
          .single();

        if (error || !userData) {
          localStorage.removeItem('falla_session_user');
          localStorage.removeItem('falla_session_impersonated');
          return;
        }

        const authUser = toAuthUser(userData);
        setUser(authUser);

        // Restaurar impersonación si el usuario real sigue siendo admin
        const savedImpersonatedId = localStorage.getItem('falla_session_impersonated');
        if (savedImpersonatedId && (authUser.role === 'admin' || authUser.role === 'master_admin')) {
          const { data: targetData } = await supabase
            .from('users')
            .select('*')
            .eq('id', savedImpersonatedId)
            .single();

          if (targetData && targetData.role !== 'admin' && targetData.role !== 'master_admin' && targetData.id !== authUser.id) {
            setImpersonatedUser(toAuthUser(targetData));
          } else {
            localStorage.removeItem('falla_session_impersonated');
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
        
        // Verificar si tiene password_hash (ya cambió contraseña)
        if (userData.password_hash) {
          // Usar contraseña hasheada
          const isValidPassword = await verifyPassword(password, userData.password_hash);
          if (!isValidPassword) {
            return { success: false, error: 'Contraseña incorrecta' };
          }
        } else {
          // Usar contraseña inicial (DNI + año)
          if (password !== expectedPassword) {
            return { success: false, error: 'Contraseña incorrecta. Use: DNI + año de nacimiento' };
          }
        }
      }

      // Establecer usuario en el contexto
      const authUser = toAuthUser(userData);

      setUser(authUser);
      localStorage.setItem('falla_session_user', authUser.id);

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
      // Durante una impersonación solo se permite cambiar la contraseña del admin real
      if (impersonatedUser && userId !== user?.id) {
        return { success: false, error: 'No se puede cambiar la contraseña de otro usuario' };
      }
      console.log('Cambiando contraseña para usuario:', userId);
      
      // Hashear nueva contraseña
      const passwordHash = await hashPassword(newPassword);
      
      // Actualizar usuario
      const { error } = await supabase
        .from('users')
        .update({
          password_hash: passwordHash,
          first_login: false,
          has_temp_password: false,
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
      setUser(null);
      setImpersonatedUser(null);
      localStorage.removeItem('falla_session_user');
      localStorage.removeItem('falla_session_impersonated');
      console.log('✅ Sesión cerrada exitosamente');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error en logout:', error);
      // Continuar aunque falle el logout
      setUser(null);
      console.log('✅ Logout completado (forzado)');
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // El token se genera y el email se envía del lado servidor (Edge Function)
      const { data, error } = await supabase.functions.invoke('send-reset-email', {
        body: { email: email.toLowerCase(), appUrl: window.location.origin }
      });

      if (error || !data?.success) {
        return { success: false, error: data?.error || 'Error al resetear contraseña' };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al resetear contraseña' };
    }
  };

  const startImpersonation = (target: AuthUser) => {
    if (!user || (user.role !== 'admin' && user.role !== 'master_admin')) return;
    if (target.id === user.id) return;
    if (target.role === 'admin' || target.role === 'master_admin') return;
    setImpersonatedUser(target);
    localStorage.setItem('falla_session_impersonated', target.id);
  };

  const stopImpersonation = () => {
    setImpersonatedUser(null);
    localStorage.removeItem('falla_session_impersonated');
  };

  const effectiveUser = impersonatedUser ?? user;

  const checkPermission = (permission: string) => {
    return hasPermission(effectiveUser?.role, permission as any);
  };

  const checkRouteAccess = (route: string) => {
    return canAccessRoute(effectiveUser?.role, route);
  };

  const value: AuthContextType = {
    user: effectiveUser,
    realUser: user,
    isImpersonating: !!impersonatedUser,
    startImpersonation,
    stopImpersonation,
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

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, User, Family, Category, Quota, MonthlyLotteryPrice, LotteryDate, LotteryTicket, LotteryPrize } from './supabase';

interface SupabaseContextType {
  user: User | null;
  users: User[];
  families: Family[];
  categories: Category[];
  quotas: Quota[];
  monthlyLotteryPrices: MonthlyLotteryPrice[];
  lotteryDates: LotteryDate[];
  lotteryTickets: LotteryTicket[];
  lotteryPrizes: LotteryPrize[];
  loading: boolean;
  error: string | null;
  
  // Auth functions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  
  // CRUD functions
  createFamily: (family: Omit<Family, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateFamily: (id: string, family: Partial<Family>) => Promise<void>;
  deleteFamily: (id: string) => Promise<void>;
  createUser: (user: Omit<User, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  createCategory: (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  createQuota: (quota: Omit<Quota, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateQuota: (id: string, quota: Partial<Quota>) => Promise<void>;
  deleteQuota: (id: string) => Promise<void>;
  createLotteryPrice: (price: Omit<MonthlyLotteryPrice, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateLotteryPrice: (id: string, price: Partial<MonthlyLotteryPrice>) => Promise<void>;
  deleteLotteryPrice: (id: string) => Promise<void>;
  createLotteryDate: (lottery: Omit<LotteryDate, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateLotteryDate: (id: string, lottery: Partial<LotteryDate>) => Promise<void>;
  deleteLotteryDate: (id: string) => Promise<void>;
  createLotteryTicket: (ticket: Omit<LotteryTicket, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateLotteryTicket: (id: string, ticket: Partial<LotteryTicket>) => Promise<void>;
  deleteLotteryTicket: (id: string) => Promise<void>;
  createLotteryPrize: (prize: Omit<LotteryPrize, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateLotteryPrize: (id: string, prize: Partial<LotteryPrize>) => Promise<void>;
  deleteLotteryPrize: (id: string) => Promise<void>;
  
  // Refresh functions
  refreshFamilies: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshQuotas: () => Promise<void>;
  refreshMonthlyLotteryPrices: () => Promise<void>;
  refreshLotteryDates: () => Promise<void>;
  refreshLotteryTickets: () => Promise<void>;
  refreshLotteryPrizes: () => Promise<void>;
}

export const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [quotas, setQuotas] = useState<Quota[]>([]);
  const [monthlyLotteryPrices, setMonthlyLotteryPrices] = useState<MonthlyLotteryPrice[]>([]);
  const [lotteryDates, setLotteryDates] = useState<LotteryDate[]>([]);
  const [lotteryTickets, setLotteryTickets] = useState<LotteryTicket[]>([]);
  const [lotteryPrizes, setLotteryPrizes] = useState<LotteryPrize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth functions
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      if (data.user) {
        // Load user data from our users table
        await loadUserData(data.user.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      if (data.user) {
        // Create user record in our users table
        await createUser({
          email: data.user.email!,
          name: userData.name || '',
          surname: userData.surname || '',
          birth_year: userData.birth_year || '',
          dni: userData.dni || '',
          phone: userData.phone || '',
          role: userData.role || 'user',
          family_id: userData.family_id,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar sesión');
      throw err;
    }
  };

  // CRUD functions
  const createFamily = async (family: Omit<Family, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('families')
        .insert([family])
        .select();
      
      if (error) throw error;
      await refreshFamilies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear familia');
      throw err;
    }
  };

  const updateFamily = async (id: string, family: Partial<Family>) => {
    try {
      const { error } = await supabase
        .from('families')
        .update(family)
        .eq('id', id);
      
      if (error) throw error;
      await refreshFamilies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar familia');
      throw err;
    }
  };

  const deleteFamily = async (id: string) => {
    try {
      const { error } = await supabase
        .from('families')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await refreshFamilies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar familia');
      throw err;
    }
  };

  const createUser = async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('users')
        .insert([user]);
      
      if (error) throw error;
      await refreshUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear usuario');
      throw err;
    }
  };

  const updateUser = async (id: string, user: Partial<User>) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(user)
        .eq('id', id);
      
      if (error) throw error;
      await refreshUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar usuario');
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await refreshUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar usuario');
      throw err;
    }
  };

  const createCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .insert([category]);
      
      if (error) throw error;
      await refreshCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear categoría');
      throw err;
    }
  };

  const updateCategory = async (id: string, category: Partial<Category>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update(category)
        .eq('id', id);
      
      if (error) throw error;
      await refreshCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar categoría');
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await refreshCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar categoría');
      throw err;
    }
  };

  const createQuota = async (quota: Omit<Quota, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('quotas')
        .insert([quota]);
      
      if (error) throw error;
      await refreshQuotas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cuota');
      throw err;
    }
  };

  const updateQuota = async (id: string, quota: Partial<Quota>) => {
    try {
      const { error } = await supabase
        .from('quotas')
        .update(quota)
        .eq('id', id);
      
      if (error) throw error;
      await refreshQuotas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar cuota');
      throw err;
    }
  };

  const deleteQuota = async (id: string) => {
    try {
      const { error } = await supabase
        .from('quotas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await refreshQuotas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar cuota');
      throw err;
    }
  };

  const refreshCategories = async () => {
    try {
      console.log('Loading categories...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
        throw error;
      }
      console.log('Categories loaded:', data);
      setCategories(data || []);
    } catch (err) {
      console.error('Exception loading categories:', err);
      setCategories([]);
      throw err;
    }
  };

  const refreshQuotas = async () => {
    try {
      console.log('Loading quotas...');
      const { data: quotasData, error: quotasError } = await supabase
        .from('quotas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (quotasError) {
        console.error('Error loading quotas:', quotasError);
        setQuotas([]);
        throw quotasError;
      }
      console.log('Quotas loaded:', quotasData);
      setQuotas(quotasData || []);
    } catch (err) {
      console.error('Exception loading quotas:', err);
      setQuotas([]);
      throw err;
    }
  };

  const refreshMonthlyLotteryPrices = async () => {
    try {
      console.log('Loading monthly lottery prices...');
      const { data, error } = await supabase
        .from('monthly_lottery_prices')
        .select('*')
        .order('year', { ascending: true })
        .order('month', { ascending: true });
      
      if (error) {
        console.error('Error loading monthly lottery prices:', error);
        setMonthlyLotteryPrices([]);
        throw error;
      }
      console.log('Monthly lottery prices loaded:', data);
      setMonthlyLotteryPrices(data || []);
    } catch (err) {
      console.error('Exception loading monthly lottery prices:', err);
      setMonthlyLotteryPrices([]);
      throw err;
    }
  };

  const refreshLotteryDates = async () => {
    try {
      console.log('Loading lottery dates...');
      const { data, error } = await supabase
        .from('lottery_dates')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) {
        console.error('Error loading lottery dates:', error);
        setLotteryDates([]);
        throw error;
      }
      console.log('Lottery dates loaded:', data);
      setLotteryDates(data || []);
    } catch (err) {
      console.error('Exception loading lottery dates:', err);
      setLotteryDates([]);
      throw err;
    }
  };

  const refreshLotteryTickets = async () => {
    try {
      console.log('Loading lottery tickets...');
      const { data, error } = await supabase
        .from('lottery_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading lottery tickets:', error);
        setLotteryTickets([]);
        throw error;
      }
      console.log('Lottery tickets loaded:', data);
      setLotteryTickets(data || []);
    } catch (err) {
      console.error('Exception loading lottery tickets:', err);
      setLotteryTickets([]);
      throw err;
    }
  };

  const refreshLotteryPrizes = async () => {
    try {
      console.log('Loading lottery prizes...');
      const { data, error } = await supabase
        .from('lottery_prizes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading lottery prizes:', error);
        setLotteryPrizes([]);
        throw error;
      }
      console.log('Lottery prizes loaded:', data);
      setLotteryPrizes(data || []);
    } catch (err) {
      console.error('Exception loading lottery prizes:', err);
      setLotteryPrizes([]);
      throw err;
    }
  };

  // CRUD functions for MonthlyLotteryPrice
  const createLotteryPrice = async (price: Omit<MonthlyLotteryPrice, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('monthly_lottery_prices')
        .insert([price])
        .select()
        .single();
      
      if (error) throw error;
      await refreshMonthlyLotteryPrices();
      return data;
    } catch (err) {
      console.error('Error creating lottery price:', err);
      throw err;
    }
  };

  const updateLotteryPrice = async (id: string, price: Partial<MonthlyLotteryPrice>) => {
    try {
      const { data, error } = await supabase
        .from('monthly_lottery_prices')
        .update(price)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      await refreshMonthlyLotteryPrices();
      return data;
    } catch (err) {
      console.error('Error updating lottery price:', err);
      throw err;
    }
  };

  const deleteLotteryPrice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('monthly_lottery_prices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await refreshMonthlyLotteryPrices();
    } catch (err) {
      console.error('Error deleting lottery price:', err);
      throw err;
    }
  };

  // CRUD functions for LotteryDate
  const createLotteryDate = async (lottery: Omit<LotteryDate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('lottery_dates')
        .insert(lottery)
        .select()
        .single();
      
      if (error) throw error;
      await refreshLotteryDates();
      return data;
    } catch (err) {
      console.error('Error creating lottery date:', err);
      throw err;
    }
  };

  const updateLotteryDate = async (id: string, lottery: Partial<LotteryDate>) => {
    try {
      const { data, error } = await supabase
        .from('lottery_dates')
        .update(lottery)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      await refreshLotteryDates();
      return data;
    } catch (err) {
      console.error('Error updating lottery date:', err);
      throw err;
    }
  };

  const deleteLotteryDate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lottery_dates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await refreshLotteryDates();
    } catch (err) {
      console.error('Error deleting lottery date:', err);
      throw err;
    }
  };

  // CRUD functions for LotteryTicket
  const createLotteryTicket = async (ticket: Omit<LotteryTicket, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('lottery_tickets')
        .insert([ticket])
        .select()
        .single();
      
      if (error) throw error;
      await refreshLotteryTickets();
      return data;
    } catch (err) {
      console.error('Error creating lottery ticket:', err);
      throw err;
    }
  };

  const updateLotteryTicket = async (id: string, ticket: Partial<LotteryTicket>) => {
    try {
      const { data, error } = await supabase
        .from('lottery_tickets')
        .update(ticket)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      await refreshLotteryTickets();
      return data;
    } catch (err) {
      console.error('Error updating lottery ticket:', err);
      throw err;
    }
  };

  const deleteLotteryTicket = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lottery_tickets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await refreshLotteryTickets();
    } catch (err) {
      console.error('Error deleting lottery ticket:', err);
      throw err;
    }
  };

  // CRUD functions for LotteryPrize
  const createLotteryPrize = async (prize: Omit<LotteryPrize, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('lottery_prizes')
        .insert([prize])
        .select()
        .single();
      
      if (error) throw error;
      await refreshLotteryPrizes();
      return data;
    } catch (err) {
      console.error('Error creating lottery prize:', err);
      throw err;
    }
  };

  const updateLotteryPrize = async (id: string, prize: Partial<LotteryPrize>) => {
    try {
      const { data, error } = await supabase
        .from('lottery_prizes')
        .update(prize)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      await refreshLotteryPrizes();
      return data;
    } catch (err) {
      console.error('Error updating lottery prize:', err);
      throw err;
    }
  };

  const deleteLotteryPrize = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lottery_prizes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await refreshLotteryPrizes();
    } catch (err) {
      console.error('Error deleting lottery prize:', err);
      throw err;
    }
  };

  // Refresh functions
  const refreshFamilies = async () => {
    try {
      console.log('Loading families...');
      const { data, error } = await supabase
        .from('families')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading families:', error);
        setFamilies([]);
        throw error;
      }
      console.log('Families loaded:', data);
      setFamilies(data || []);
    } catch (err) {
      console.error('Exception loading families:', err);
      setFamilies([]);
      throw err;
    }
  };

  const refreshUsers = async () => {
    try {
      console.log('Loading users...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading users:', error);
        throw error;
      }
      console.log('Users loaded:', data);
      setUsers(data || []);
      // Set current user if logged in
      if (data && user) {
        const currentUser = data.find(u => u.id === user.id);
        if (currentUser) setUser(currentUser);
      }
      console.log('Loading quotas...');
      const { data: quotasData, error: quotasError } = await supabase
        .from('quotas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (quotasError) {
        console.error('Error loading quotas:', quotasError);
        setQuotas([]);
        throw quotasError;
      }
      console.log('Quotas loaded:', quotasData);
      setQuotas(quotasData || []);
    } catch (err) {
      console.error('Exception loading quotas:', err);
      setQuotas([]);
      throw err;
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      console.log('Loading user data for ID:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error loading user data:', error);
        // If user not found in database, create a basic user object from auth
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          console.log('Creating temp user from auth:', authUser);
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.name || 'Usuario',
            surname: authUser.user_metadata?.surname || '',
            role: 'master_admin' // Temporal para pruebas
          });
        }
        return;
      }
      
      console.log('User data loaded:', data);
      setUser(data);
    } catch (err) {
      console.error('Exception loading user data:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar datos del usuario');
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // REACTIVAR CARGA DE DATOS - RLS está arreglado
        console.log('Loading data from Supabase...');
        
        await Promise.all([
          refreshFamilies(),
          refreshCategories(),
          refreshQuotas(),
          refreshUsers(), // AÑADIDO: cargar usuarios
          refreshMonthlyLotteryPrices(), // AÑADIDO: cargar precios de lotería
          refreshLotteryDates(), // AÑADIDO: cargar fechas de lotería
          refreshLotteryTickets(), // AÑADIDO: cargar papeletas de lotería
          refreshLotteryPrizes(), // AÑADIDO: cargar premios de lotería
        ]);
        
        // Check current auth state - DESHABILITADO para evitar conflictos con AuthContext
        // El AuthContext maneja toda la autenticación
        console.log('SupabaseContext: Auth check deshabilitado - AuthContext maneja la autenticación');
        setUser(null);
      } catch (err) {
        console.error('Error in loadData:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Listen for auth changes - DESHABILITADO TEMPORALMENTE
    // El AuthContext maneja la autenticación ahora
    /*
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        if (session?.user) {
          try {
            await loadUserData(session.user.id);
          } catch (err) {
            console.warn('Could not load user from DB, using temp user:', err);
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || 'David',
              surname: session.user.user_metadata?.surname || 'Solano',
              role: 'master_admin'
            });
          }
        } else {
          // FORZAR USUARIO TEMPORAL PARA DESARROLLO
          console.log('No session, creating temp user for development');
          setUser({
            id: 'temp-dev-user',
            email: 'davidsolanosan@gmail.com',
            name: 'David',
            surname: 'Solano',
            role: 'master_admin'
          });
        }
      }
    );
    */

    return () => {
      // No hay subscription que limpiar - está deshabilitado
      console.log('SupabaseContext: Auth listener deshabilitado');
    };
  }, []);

  const value = {
    user,
    users,
    families,
    categories,
    quotas,
    monthlyLotteryPrices,
    lotteryDates,
    lotteryTickets,
    lotteryPrizes,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    createFamily,
    updateFamily,
    deleteFamily,
    createUser,
    updateUser,
    deleteUser,
    createCategory,
    updateCategory,
    deleteCategory,
    createQuota,
    updateQuota,
    deleteQuota,
    createLotteryPrice,
    updateLotteryPrice,
    deleteLotteryPrice,
    createLotteryDate,
    updateLotteryDate,
    deleteLotteryDate,
    createLotteryTicket,
    updateLotteryTicket,
    deleteLotteryTicket,
    createLotteryPrize,
    updateLotteryPrize,
    deleteLotteryPrize,
    refreshFamilies,
    refreshUsers,
    refreshCategories,
    refreshQuotas,
    refreshMonthlyLotteryPrices,
    refreshLotteryDates,
    refreshLotteryTickets,
    refreshLotteryPrizes,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase(): SupabaseContextType {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}

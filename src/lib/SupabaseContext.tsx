import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, User, Family, Category, Quota, MonthlyLotteryPrice, LotteryDate, LotteryTicket, LotteryPrize, Event, EventPrice, EventRegistration, News } from './supabase';
import { generateInitialPassword, hashPassword, verifyPassword, validateEmail } from '../utils/authUtils';

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
  events: Event[];
  eventPrices: EventPrice[];
  eventRegistrations: EventRegistration[];
  news: News[];
  familyRepresentatives: {family_id: string, user_id: string}[];
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
  deleteFamilyWithoutRefresh: (id: string) => Promise<void>;
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
  createLotteryDate: (date: Omit<LotteryDate, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateLotteryDate: (id: string, date: Partial<LotteryDate>) => Promise<void>;
  deleteLotteryDate: (id: string) => Promise<void>;
  createLotteryTicket: (ticket: Omit<LotteryTicket, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateLotteryTicket: (id: string, ticket: Partial<LotteryTicket>) => Promise<void>;
  deleteLotteryTicket: (id: string) => Promise<void>;
  createLotteryPrize: (prize: Omit<LotteryPrize, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateLotteryPrize: (id: string, prize: Partial<LotteryPrize>) => Promise<void>;
  deleteLotteryPrize: (id: string) => Promise<void>;
  
  // Event CRUD functions
  createEvent: (event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  createEventPrice: (price: Omit<EventPrice, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateEventPrice: (id: string, price: Partial<EventPrice>) => Promise<void>;
  deleteEventPrice: (id: string) => Promise<void>;
  createEventRegistration: (registration: Omit<EventRegistration, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateEventRegistration: (id: string, registration: Partial<EventRegistration>) => Promise<void>;
  deleteEventRegistration: (id: string) => Promise<void>;
  
  // News CRUD functions
  createNews: (news: Omit<News, 'id' | 'created_at' | 'updated_at'>) => Promise<News>;
  updateNews: (id: string, news: Partial<News>) => Promise<News>;
  deleteNews: (id: string) => Promise<void>;
  setRepresentatives: (familyId: string, userIds: string[]) => Promise<void>;
  
  // Refresh functions
  refreshFamilies: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshQuotas: () => Promise<void>;
  refreshMonthlyLotteryPrices: () => Promise<void>;
  refreshLotteryDates: () => Promise<void>;
  refreshLotteryTickets: () => Promise<void>;
  refreshLotteryPrizes: () => Promise<void>;
  refreshEvents: () => Promise<void>;
  refreshEventPrices: () => Promise<void>;
  refreshEventRegistrations: () => Promise<void>;
  refreshNews: () => Promise<void>;
  refreshFamilyRepresentatives: () => Promise<void>;
  
  // Funciones de autenticación
  loginUser: (email: string, password: string) => Promise<{user: User, isFirstLogin: boolean}>;
  changePassword: (userId: string, newPassword: string) => Promise<void>;
  initializeUserPasswords: () => Promise<void>;
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
  const [events, setEvents] = useState<Event[]>([]);
  const [eventPrices, setEventPrices] = useState<EventPrice[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [familyRepresentatives, setFamilyRepresentatives] = useState<{family_id: string, user_id: string}[]>([]);
  
  // Banderas para evitar cargas múltiples
  const [isLoadingLotteryDates, setIsLoadingLotteryDates] = useState(false);
  const [isLoadingLotteryTickets, setIsLoadingLotteryTickets] = useState(false);
  const [isLoadingLotteryPrizes, setIsLoadingLotteryPrizes] = useState(false);
  
  // Bandera global para controlar la carga inicial
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  
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
      
      // Devolver la primera familia creada
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear familia');
      throw err;
    }
  };

  const updateFamily = async (id: string, family: Partial<Family>) => {
    try {
      console.log('🗄️ updateFamily called with:', { id, family });
      
      // Primero verificar qué campos existen realmente en la BD
      const { data: existingFamily } = await supabase
        .from('families')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!existingFamily) {
        throw new Error('Familia no encontrada');
      }
      
      console.log('🗄️ Existing family data:', existingFamily);
      
      // Solo incluir campos que existen en la BD actual
      const updateData: any = {};
      
      // Campos básicos que siempre deberían existir
      if (family.name !== undefined) updateData.name = family.name;
      if (family.address !== undefined) updateData.address = family.address;
      if (family.phone !== undefined) updateData.phone = family.phone;
      if (family.representative_id !== undefined) updateData.representative_id = family.representative_id;
      
      // Campos de papeletas - solo si existen en la BD
      if ('ticket_start' in existingFamily && family.ticket_start !== undefined) {
        updateData.ticket_start = family.ticket_start;
      }
      if ('ticket_end' in existingFamily && family.ticket_end !== undefined) {
        updateData.ticket_end = family.ticket_end;
      }
      if ('ordinary_tickets' in existingFamily && family.ordinary_tickets !== undefined) {
        updateData.ordinary_tickets = family.ordinary_tickets;
      }
      if ('christmas_tickets' in existingFamily && family.christmas_tickets !== undefined) {
        updateData.christmas_tickets = family.christmas_tickets;
      }
      if ('child_tickets' in existingFamily && family.child_tickets !== undefined) {
        updateData.child_tickets = family.child_tickets;
      }
      if ('horta_tickets' in existingFamily && family.horta_tickets !== undefined) {
        updateData.horta_tickets = family.horta_tickets;
      }
      
      console.log('🗄️ updateData filtered:', updateData);
      
      // Si no hay nada que actualizar, retornar la familia existente
      if (Object.keys(updateData).length === 0) {
        console.log('🗄️ No fields to update, returning existing family');
        return existingFamily;
      }
      
      const { data, error } = await supabase
        .from('families')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      console.log('✅ Supabase update successful:', data);
      await refreshFamilies();
      console.log('✅ Families refreshed');
      return data;
    } catch (err) {
      console.error('❌ updateFamily error:', err);
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

  const deleteFamilyWithoutRefresh = async (id: string) => {
    try {
      const { error } = await supabase
        .from('families')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      // No actualizar automáticamente
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
    // Evitar cargas múltiples
    if (isLoadingLotteryDates) {
      console.log('Lottery dates already loading, skipping...');
      return;
    }
    
    try {
      setIsLoadingLotteryDates(true);
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
      console.log('Lottery dates loaded:', data?.length || 0, 'items');
      setLotteryDates(data || []);
    } catch (err) {
      console.error('Exception loading lottery dates:', err);
      setLotteryDates([]);
      throw err;
    } finally {
      setIsLoadingLotteryDates(false);
    }
  };

  const refreshLotteryTickets = async () => {
    // Evitar cargas múltiples
    if (isLoadingLotteryTickets) {
      console.log('Lottery tickets already loading, skipping...');
      return;
    }
    
    try {
      setIsLoadingLotteryTickets(true);
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
      console.log('Lottery tickets loaded:', data?.length || 0, 'items');
      setLotteryTickets(data || []);
    } catch (err) {
      console.error('Exception loading lottery tickets:', err);
      setLotteryTickets([]);
      throw err;
    } finally {
      setIsLoadingLotteryTickets(false);
    }
  };

  const refreshLotteryPrizes = async () => {
    // Evitar cargas múltiples
    if (isLoadingLotteryPrizes) {
      console.log('Lottery prizes already loading, skipping...');
      return;
    }
    
    try {
      setIsLoadingLotteryPrizes(true);
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
      console.log('Lottery prizes loaded:', data?.length || 0, 'items');
      setLotteryPrizes(data || []);
    } catch (err) {
      console.error('Exception loading lottery prizes:', err);
      setLotteryPrizes([]);
      throw err;
    } finally {
      setIsLoadingLotteryPrizes(false);
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

  // Refresh functions for Events
  const refreshEvents = async () => {
    try {
      console.log('Loading events...');
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading events:', error);
        setEvents([]);
        throw error;
      }
      console.log('Events loaded:', data);
      setEvents(data || []);
    } catch (err) {
      console.error('Exception loading events:', err);
      setEvents([]);
      throw err;
    }
  };

  const refreshEventPrices = async () => {
    try {
      console.log('Loading event prices...');
      const { data, error } = await supabase
        .from('event_prices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading event prices:', error);
        setEventPrices([]);
        throw error;
      }
      console.log('Event prices loaded:', data);
      setEventPrices(data || []);
    } catch (err) {
      console.error('Exception loading event prices:', err);
      setEventPrices([]);
      throw err;
    }
  };

  const refreshEventRegistrations = async () => {
    try {
      console.log('Loading event registrations...');
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .order('registered_at', { ascending: false });
      
      if (error) {
        console.error('Error loading event registrations:', error);
        setEventRegistrations([]);
        throw error;
      }
      console.log('Event registrations loaded:', data);
      setEventRegistrations(data || []);
    } catch (err) {
      console.error('Exception loading event registrations:', err);
      setEventRegistrations([]);
      throw err;
    }
  };

  const refreshNews = async () => {
    try {
      console.log('Loading news...');
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading news:', error);
        setNews([]);
        throw error;
      }
      console.log('News loaded:', data);
      setNews(data || []);
    } catch (err) {
      console.error('Exception loading news:', err);
      setNews([]);
      throw err;
    }
  };

  const refreshFamilyRepresentatives = async () => {
    try {
      console.log('Loading family representatives...');
      const { data, error } = await supabase
        .from('family_representatives')
        .select('*');
      
      if (error) {
        console.error('Error loading family representatives:', error);
        setFamilyRepresentatives([]);
        throw error;
      }
      console.log('Family representatives loaded:', data);
      setFamilyRepresentatives(data || []);
    } catch (err) {
      console.error('Exception loading family representatives:', err);
      setFamilyRepresentatives([]);
      throw err;
    }
  };

  // CRUD functions for Events
  const createEvent = async (event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([event])
        .select()
        .single();
      
      if (error) throw error;
      await refreshEvents();
      return data;
    } catch (err) {
      console.error('Error creating event:', err);
      throw err;
    }
  };

  const updateEvent = async (id: string, event: Partial<Event>) => {
    try {
      const { error } = await supabase
        .from('events')
        .update(event)
        .eq('id', id);
      
      if (error) throw error;
      await refreshEvents();
    } catch (err) {
      console.error('Error updating event:', err);
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await refreshEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      throw err;
    }
  };

  const createEventPrice = async (price: Omit<EventPrice, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('event_prices')
        .insert([price])
        .select()
        .single();
      
      if (error) throw error;
      await refreshEventPrices();
      return data;
    } catch (err) {
      console.error('Error creating event price:', err);
      throw err;
    }
  };

  const updateEventPrice = async (id: string, price: Partial<EventPrice>) => {
    try {
      const { error } = await supabase
        .from('event_prices')
        .update(price)
        .eq('id', id);
      
      if (error) throw error;
      await refreshEventPrices();
    } catch (err) {
      console.error('Error updating event price:', err);
      throw err;
    }
  };

  const deleteEventPrice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('event_prices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await refreshEventPrices();
    } catch (err) {
      console.error('Error deleting event price:', err);
      throw err;
    }
  };

  const createEventRegistration = async (registration: Omit<EventRegistration, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .insert([registration])
        .select()
        .single();
      
      if (error) throw error;
      await refreshEventRegistrations();
      return data;
    } catch (err) {
      console.error('Error creating event registration:', err);
      throw err;
    }
  };

  const updateEventRegistration = async (id: string, registration: Partial<EventRegistration>) => {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update(registration)
        .eq('id', id);
      
      if (error) throw error;
      await refreshEventRegistrations();
    } catch (err) {
      console.error('Error updating event registration:', err);
      throw err;
    }
  };

  const deleteEventRegistration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await refreshEventRegistrations();
    } catch (err) {
      console.error('Error deleting event registration:', err);
      throw err;
    }
  };

  // News CRUD functions
  const createNews = async (news: Omit<News, 'id' | 'created_at' | 'updated_at'>): Promise<News> => {
    try {
      const { data, error } = await supabase
        .from('news')
        .insert([news])
        .select()
        .single();
      
      if (error) throw error;
      
      await refreshNews();
      return data;
    } catch (err) {
      console.error('Error creating news:', err);
      throw err;
    }
  };

  const updateNews = async (id: string, news: Partial<News>): Promise<News> => {
    try {
      const { data, error } = await supabase
        .from('news')
        .update(news)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      await refreshNews();
      return data;
    } catch (err) {
      console.error('Error updating news:', err);
      throw err;
    }
  };

  const deleteNews = async (id: string) => {
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await refreshNews();
    } catch (err) {
      console.error('Error deleting news:', err);
      throw err;
    }
  };

  const setRepresentatives = async (familyId: string, userIds: string[]) => {
    try {
      console.log('Setting representatives for family:', familyId, userIds);
      
      // Borrar los actuales
      const { error: deleteError } = await supabase
        .from('family_representatives')
        .delete()
        .eq('family_id', familyId);
      
      if (deleteError) throw deleteError;
      
      // Insertar los nuevos
      if (userIds.length > 0) {
        const { error: insertError } = await supabase
          .from('family_representatives')
          .insert(userIds.map(userId => ({ family_id: familyId, user_id: userId })));
        
        if (insertError) throw insertError;
      }
      
      await refreshFamilyRepresentatives();
      console.log('✅ Representatives updated successfully');
    } catch (err) {
      console.error('Error setting representatives:', err);
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
        .order('created_at', { ascending: false })
        .limit(1000); // Forzar límite alto para asegurar todos los usuarios
      
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

  // Funciones de autenticación
  const loginUser = async (email: string, password: string) => {
    try {
      if (!validateEmail(email)) {
        throw new Error('Email inválido');
      }

      // Buscar usuario por email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (userError || !userData) {
        throw new Error('Usuario no encontrado');
      }

      // Generar contraseña esperada
      const expectedPassword = generateInitialPassword(userData.dni || '', userData.birth_year || '');
      
      // Verificar si tiene password_hash (ya cambió contraseña)
      if (userData.password_hash) {
        // Usar contraseña hasheada
        const isValidPassword = await verifyPassword(password, userData.password_hash);
        if (!isValidPassword) {
          throw new Error('Contraseña incorrecta');
        }
        
        return {
          user: userData,
          isFirstLogin: false
        };
      } else {
        // Usar contraseña inicial (DNI + año)
        if (password !== expectedPassword) {
          throw new Error('Contraseña incorrecta. Use: DNI + año de nacimiento');
        }
        
        return {
          user: userData,
          isFirstLogin: true
        };
      }
    } catch (err) {
      console.error('Error en login:', err);
      throw err;
    }
  };

  const changePassword = async (userId: string, newPassword: string) => {
    try {
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
      
      // Actualizar estado local
      await refreshUsers();
    } catch (err) {
      console.error('Error cambiando contraseña:', err);
      throw err;
    }
  };

  const initializeUserPasswords = async () => {
    try {
      console.log('Inicializando contraseñas de usuarios...');
      
      // Obtener todos los usuarios sin password_hash
      const { data: usersWithoutPassword, error } = await supabase
        .from('users')
        .select('*')
        .is('password_hash', null);

      if (error) throw error;
      
      console.log(`Usuarios sin contraseña: ${usersWithoutPassword?.length || 0}`);
      
      // Para cada usuario, establecer first_login = true
      for (const user of usersWithoutPassword || []) {
        const { error: updateError } = await supabase
          .from('users')
          .update({
            first_login: true
          })
          .eq('id', user.id);
          
        if (updateError) {
          console.error(`Error actualizando usuario ${user.id}:`, updateError);
        }
      }
      
      console.log('Contraseñas inicializadas correctamente');
      await refreshUsers();
    } catch (err) {
      console.error('Error inicializando contraseñas:', err);
      throw err;
    }
  };

  // Load initial data
  useEffect(() => {
    // Evitar cargas múltiples
    if (hasLoadedInitialData) {
      console.log('Initial data already loaded, skipping...');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setHasLoadedInitialData(true);
        
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
          refreshEvents(), // AÑADIDO: cargar eventos
          refreshEventPrices(), // AÑADIDO: cargar precios de eventos
          refreshEventRegistrations(), // AÑADIDO: cargar inscripciones de eventos
          refreshNews(), // AÑADIDO: cargar noticias
          refreshFamilyRepresentatives(), // AÑADIDO: cargar representantes de familias
        ]);
        
        // Check current auth state - DESHABILITADO para evitar conflictos con AuthContext
        // El AuthContext maneja toda la autenticación
        console.log('SupabaseContext: Auth check deshabilitado - AuthContext maneja la autenticación');
        setUser(null);
      } catch (err) {
        console.error('Error in loadData:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
        // Resetear la bandera si hubo error para permitir reintentar
        setHasLoadedInitialData(false);
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
  }, [hasLoadedInitialData]); // Añadir dependencia explícita

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
    events,
    eventPrices,
    eventRegistrations,
    news,
    familyRepresentatives,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    createFamily,
    updateFamily,
    deleteFamily,
    deleteFamilyWithoutRefresh,
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
    createEvent,
    updateEvent,
    deleteEvent,
    createEventPrice,
    updateEventPrice,
    deleteEventPrice,
    createEventRegistration,
    updateEventRegistration,
    deleteEventRegistration,
    createNews,
    updateNews,
    deleteNews,
    setRepresentatives,
    refreshFamilies,
    refreshUsers,
    refreshCategories,
    refreshQuotas,
    refreshMonthlyLotteryPrices,
    refreshLotteryDates,
    refreshLotteryTickets,
    refreshLotteryPrizes,
    refreshEvents,
    refreshEventPrices,
    refreshEventRegistrations,
    refreshNews,
    refreshFamilyRepresentatives,
    // Funciones de autenticación
    loginUser,
    changePassword,
    initializeUserPasswords,
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

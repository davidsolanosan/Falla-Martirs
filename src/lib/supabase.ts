import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://ojhebvlzhoeaabkbifvy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaGVidmx6aG9lYWFia2JpZnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMTkyNzcsImV4cCI6MjA5MDY5NTI3N30.etDN7WIrYUg4Af7DFyQQDlv4Yb0QWub5qhSbgvDQLxo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para la base de datos
export interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
  birth_year: string;
  dni: string;
  phone: string;
  role: 'user' | 'admin' | 'master_admin';
  family_id?: string; // Familia de cuotas (donde paga)
  event_family_id?: string; // Familia de eventos (donde apunta)
  category_id?: string; // Referencia a la categoría del fallero
  // Campos adicionales del CSV
  codigo_jcf?: string;
  numero_censo?: string;
  address?: string;
  poblacion?: string;
  codigo_postal?: string;
  sexo?: string;
  correu?: string;
  cargo?: string;
  recompensa?: string;
  // Campos de autenticación
  password_hash?: string;
  first_login?: boolean;
  password_changed_at?: string;
  created_at: string;
  updated_at: string;
}

// Para compatibilidad con Supabase Auth
export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    role?: string;
  };
  app_metadata?: {
    role?: string;
  };
}

export interface Family {
  id: string;
  name: string;
  address: string;
  phone: string;
  representative_id?: string; // ID del usuario representante de la familia
  ticket_start?: number; // Numeración inicial de papeletas
  ticket_end?: number; // Numeración final de papeletas
  ordinary_tickets?: number; // Papeletas sorteos ordinarios (49)
  christmas_tickets?: number; // Papeletas Lotería Navidad
  child_tickets?: number; // Papeletas Lotería Niño
  horta_tickets?: number; // Papeletas Lotería Horta Nord
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  quotaamount: number; // <-- Corregido: quotaamount en minúsculas
  min_age: number;
  max_age: number;
  created_at: string;
  updated_at: string;
}

export interface Quota {
  id: string;
  family_id: string;
  year: number;
  month: string;
  base_amount: number;
  lottery_discount: number;
  total_amount: number;
  paid_amount: number;
  status: 'pending' | 'partial' | 'paid';
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyLotteryPrice {
  id: string;
  month: string;
  year: number;
  price: number;
  discount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lottery {
  id: string;
  name: string;
  total_tickets: number;
  year: number;
  created_at: string;
  updated_at: string;
}

export interface LotteryDate {
  id: string;
  date: string; // YYYY-MM-DD format
  name: string;
  special: boolean;
  lottery_type: 'ordinary' | 'christmas' | 'child' | 'horta'; // Tipo de sorteo
  lottery_price: number; // Precio de lotería (0.50 ordinario, 2.50 especial)
  primitive_price?: number; // Precio de primitiva (0.30 ordinario, null especial)
  donation_price: number; // Precio de donación (0.20 ordinario, 0.50 especial)
  prize_amount?: number; // Cantidad premiada total del sorteo
  ordinary_benefit?: number; // Beneficio por papeleta ordinaria
  christmas_benefit?: number; // Beneficio por papeleta Navidad
  child_benefit?: number; // Beneficio por papeleta Niño
  horta_benefit?: number; // Beneficio por papeleta Horta Nord
  created_at: string;
  updated_at: string;
}

export interface LotteryTicket {
  id: string;
  lottery_date_id: string;
  user_id: string;
  family_id: string;
  lottery_number: string; // Número de lotería (64567)
  primitive_numbers: string[]; // [5,6,9,11,21,28,33,42]
  lottery_amount: number; // 0.50
  primitive_amount: number; // 0.30
  donation_amount: number; // 0.20
  total_amount: number; // 1.00
  is_paid: boolean;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LotteryPrize {
  id: string;
  lottery_date_id: string;
  prize_type: 'lottery' | 'primitive';
  prize_category: string; // "1er Premio", "2º Premio", "Primitiva", etc.
  prize_amount: number;
  winning_numbers?: string[]; // Para primitiva
  winning_number?: string; // Para lotería nacional
  description: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  details: any;
  created_at: string;
}

// Eventos
export interface Event {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  event_date: string;
  registration_deadline: string;
  is_active: boolean;
  includes_meal: boolean;
  site?: string;
  time?: string;
  news_id?: string; // Relación con noticia generada automáticamente
  created_at: string;
  updated_at: string;
}

export interface EventPrice {
  id: string;
  event_id: string;
  category_id: string;
  price: number;
  includes_meal: boolean;
  created_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  family_id: string; // Familia de cuotas (donde se imputa el coste)
  event_family_id: string; // Familia de eventos (desde donde se apunta)
  category_id: string;
  includes_meal: boolean;
  total_price: number;
  registered_by?: string; // ID del usuario que inscribió (representante)
  registered_at: string;
}

// Noticias
export interface News {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  author: string;
  status: 'draft' | 'published' | 'hidden';
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface NewsRead {
  id: string;
  news_id: string;
  user_id: string;
  read_at: string;
}

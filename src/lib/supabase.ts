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
  family_id?: string;
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
  created_at: string;
  updated_at: string;
}

export interface Family {
  id: string;
  name: string;
  address: string;
  phone: string;
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
  lottery_price: number; // Precio de lotería (0.50 ordinario, 2.50 especial)
  primitive_price?: number; // Precio de primitiva (0.30 ordinario, null especial)
  donation_price: number; // Precio de donación (0.20 ordinario, 0.50 especial)
  prize_amount?: number; // Cantidad premiada total del sorteo
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

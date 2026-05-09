export type Role = 'master_admin' | 'admin' | 'user';

export interface MonthlyPayment {
  totalAmount: number; // cuota mensual según categoría
  lotteryAmount: number; // cantidad en papeletas (0.5€ cada)
  moneyAmount: number; // cantidad en dinero
  lotteryTickets: number; // número de papeletas
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  familyId?: string;
  categoryId: string;
  isAdult: boolean;
  isFamilyAdmin: boolean;
  apellidos?: string;
  surname?: string; // Para compatibilidad
  dni?: string;
  telefono?: string;
  direccion?: string;
  address?: string; // Campo real de dirección
  poblacion?: string;
  codigoPostal?: string;
  anyoNacimiento?: string;
  birth_year?: string; // Campo real de fecha de nacimiento
  sexo?: string;
  sexe?: string; // Campo del Excel (SEXE)
  cargo?: string;
  recompensa?: string;
  codigoJCF?: string;
  numeroCenso?: string;
  tutor?: string; // Nuevo campo para menores
  telefono_tutor?: string; // Nuevo campo para menores
  monthlyPayment?: MonthlyPayment;
  masterAdminId?: string;
}

export interface Family {
  id: string;
  name: string; // e.g., "Familia García Pérez"
  address: string;
  phone: string;
  representativeIds: string[]; // Array de IDs de representantes
  members: string[]; // User IDs
  totalMonthlyPayment?: MonthlyPayment; // total mensual de la familia
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string; // e.g., "Infantil", "Mayor", "Jubilado"
  quotaamount: number;
  min_age: number; // ← snake_case como en la BD
  max_age: number; // ← snake_case como en la BD
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  price: number;
  attendees: string[]; // User IDs
}

export interface Lottery {
  id: string;
  name: string; // e.g., "Lotería Navidad 2026"
  totalTickets: number;
  assignedToFamily: Record<string, number>; // familyId -> number of tickets
  soldByFamily: Record<string, number>;
  year: number; // Año fallero (ej: 2025-2026)
  monthlyPrices: MonthlyLotteryPrice[]; // Precios por cada mes
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyLotteryPrice {
  id: string;
  month: string; // "abril", "mayo", etc.
  year: number; // 2025, 2026
  price: number; // Coste de la papeleta
  discount: number; // Descuento en quota (0.50€)
  isActive: boolean; // Si está disponible para venta
  created_at: string;
  updated_at: string;
}

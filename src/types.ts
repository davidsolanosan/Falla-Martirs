export type Role = 'master_admin' | 'admin' | 'directiva' | 'delegado_loteria' | 'delegado_festejos' | 'fallero';

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
  dni?: string;
  telefono?: string;
  direccion?: string;
  poblacion?: string;
  codigoPostal?: string;
  anyoNacimiento?: string;
  sexo?: string;
  cargo?: string;
  recompensa?: string;
  codigoJCF?: string;
  numeroCenso?: string;
  monthlyPayment?: MonthlyPayment; // cuota mensual calculada
  masterAdminId?: string; // ID del master admin que autorizó este rol
}

export interface Family {
  id: string;
  name: string; // e.g., "Familia García Pérez"
  representativeIds: string[]; // Array de IDs de representantes
  members: string[]; // User IDs
  totalMonthlyPayment?: MonthlyPayment; // total mensual de la familia
}

export interface Category {
  id: string;
  name: string; // e.g., "Infantil", "Mayor", "Jubilado"
  quotaAmount: number;
  minAge?: number; // Edad mínima (opcional)
  maxAge?: number; // Edad máxima (opcional)
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
}

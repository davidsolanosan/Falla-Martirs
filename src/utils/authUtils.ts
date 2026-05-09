import bcrypt from 'bcryptjs';

// Función para extraer el año de birth_year
export const extractYear = (birthYear: string): string => {
  if (!birthYear) return '';
  
  // Si es formato dd/mm/yyyy o dd-mm-yyyy
  if (birthYear.includes('/') || birthYear.includes('-')) {
    const parts = birthYear.includes('/') ? birthYear.split('/') : birthYear.split('-');
    return parts[parts.length - 1]; // Tomar el último elemento (año)
  }
  
  // Si ya es solo el año
  return birthYear;
};

// Función para generar contraseña inicial
export const generateInitialPassword = (dni: string, birthYear: string): string => {
  if (!dni || !birthYear) return '';
  
  const year = extractYear(birthYear);
  return `${dni}${year}`;
};

// Función para validar DNI/NIE español
export const validateDNI = (dni: string): boolean => {
  if (!dni) return false;
  
  // Expresión regular para DNI (8 números + letra) o NIE
  const dniRegex = /^[0-9]{8}[A-Z]$/i;
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/i;
  
  return dniRegex.test(dni.toUpperCase()) || nieRegex.test(dni.toUpperCase());
};

// Función para hashear contraseña
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Función para verificar contraseña
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// Función para validar formato de email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Función para generar contraseña segura
export const generateSecurePassword = (): string => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
};

// Función para validar contraseña segura
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe tener al menos una mayúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe tener al menos una minúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe tener al menos un número');
  }
  
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('La contraseña debe tener al menos un carácter especial (!@#$%^&*)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

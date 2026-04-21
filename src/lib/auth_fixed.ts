import bcrypt from 'bcryptjs';

// SALT rounds para encriptación
const SALT_ROUNDS = 12;

/**
 * Encripta una contraseña usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  console.log('Hashing password:', password);
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  console.log('Generated hash:', hash);
  return hash;
}

/**
 * Verifica si una contraseña coincide con el hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  console.log('Verifying password:', password);
  console.log('Against hash:', hash);
  
  try {
    const result = await bcrypt.compare(password, hash);
    console.log('Bcrypt comparison result:', result);
    return result;
  } catch (error) {
    console.error('Error in password verification:', error);
    return false;
  }
}

/**
 * Genera una contraseña inicial para un fallero
 * Formato: DNI + año de nacimiento
 */
export function generateInitialPassword(dni: string, birthYear: string): string {
  // Limpiar DNI (quitar espacios)
  const cleanDni = dni.replace(/\s+/g, '');
  // Extraer solo el año del birthYear si contiene fecha completa
  const year = birthYear.includes('/') ? birthYear.split('/')[2] : birthYear;
  return `${cleanDni}${year}`;
}

/**
 * Valida si una contraseña cumple los requisitos mínimos
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una mayúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una minúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Genera un token de reset de contraseña
 */
export function generateResetToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Genera un token de sesión simple
 */
export function generateSessionToken(): string {
  return generateResetToken();
}

import { verifyPassword } from './lib/auth';

// Test para verificar si el hashing funciona correctamente
async function testPasswordVerification() {
  const password = 'SUPER123A1980';
  const hash = '$2b$12$LQv3c1yqBWVHxkd0L9xOeK8t5Xq5Xq5Xq5Xq5Xq5Xq5Xq5Xq5Xq5Xq5Xq5Xq';

  console.log('Password a verificar:', password);
  console.log('Hash esperado:', hash);
  
  try {
    const isValid = await verifyPassword(password, hash);
    console.log('¿La verificación funciona?', isValid);
    console.log('Resultado completo:', { password, hash, isValid });
  } catch (error) {
    console.error('Error en verificación:', error);
  }
}

// Ejecutar el test
testPasswordVerification();

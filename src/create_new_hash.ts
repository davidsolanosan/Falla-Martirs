import { hashPassword } from './lib/auth';

// Crear un hash nuevo para la contraseña SUPER123A1980
async function createNewHash() {
  const password = 'SUPER123A1980';
  
  try {
    const newHash = await hashPassword(password);
    console.log('Contraseña:', password);
    console.log('Nuevo hash:', newHash);
    console.log('Longitud del hash:', newHash.length);
    
    // Actualizar el usuario con el nuevo hash
    const { supabase } = await import('./lib/supabase');
    
    const { error } = await supabase.default
      .from('users')
      .update({ 
        password_hash: newHash,
        has_temp_password: false 
      })
      .eq('email', 'newalfree@gmail.com');
    
    if (error) {
      console.error('Error actualizando hash:', error);
    } else {
      console.log('¡Hash actualizado exitosamente!');
    }
  } catch (error) {
    console.error('Error creando hash:', error);
  }
}

// Ejecutar la función
createNewHash();

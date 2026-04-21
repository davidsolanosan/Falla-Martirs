import { supabase } from '../lib/supabase';
import { hashPassword, generateInitialPassword, hasLoginPermission } from '../lib/auth';

/**
 * Genera contraseñas iniciales para todos los usuarios que cumplen los requisitos
 */
export async function generateInitialPasswords() {
  try {
    // Obtener usuarios con email y categorías permitidas
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        *,
        role
      `)
      .not('email', 'is', null)
      .not('birth_year', 'is', null)
      .not('dni', 'is', null)
      .is('password_hash', null);

    if (error) {
      throw new Error(`Error obteniendo usuarios: ${error.message}`);
    }

    const results = [];
    const allowedRoles = ['user', 'admin'];

    const hasLoginPermission = (role: string): boolean => {
      return allowedRoles.includes(role);
    };

    for (const user of users || []) {
      // Verificar si tiene permiso de login
      if (!hasLoginPermission(user.role || '')) {
        results.push({
          user: `${user.name} ${user.surname}`,
          email: user.email,
          category: user.role,
          status: 'skipped',
          reason: 'Rol no permitido'
        });
        continue;
      }

      // Generar contraseña inicial
      const initialPassword = generateInitialPassword(user.dni, user.birth_year);
      const passwordHash = await hashPassword(initialPassword);

      // Actualizar usuario
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: passwordHash,
          has_temp_password: true
        })
        .eq('id', user.id);

      if (updateError) {
        results.push({
          user: `${user.name} ${user.surname}`,
          email: user.email,
          category: user.role,
          status: 'error',
          reason: updateError.message
        });
      } else {
        results.push({
          user: `${user.name} ${user.surname}`,
          email: user.email,
          category: user.role,
          dni: user.dni,
          birth_year: user.birth_year,
          password: initialPassword,
          status: 'success'
        });
      }
    }

    return {
      success: true,
      total: users?.length || 0,
      processed: results.length,
      results
    };

  } catch (error) {
    console.error('Error generando contraseñas:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Genera contraseña para un usuario específico
 */
export async function generatePasswordForUser(userId: string) {
  try {
    // Obtener usuario
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        role
      `)
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar permisos
    if (!hasLoginPermission(user.role || '')) {
      throw new Error('El rol de este usuario no tiene permiso de acceso');
    }

    if (!user.email || !user.birth_year || !user.dni) {
      throw new Error('El usuario debe tener email, año de nacimiento y DNI');
    }

    // Generar contraseña
    const initialPassword = generateInitialPassword(user.dni, user.birth_year);
    const passwordHash = await hashPassword(initialPassword);

    // Actualizar usuario
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        has_temp_password: true
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Error actualizando usuario: ${updateError.message}`);
    }

    return {
      success: true,
      user: `${user.name} ${user.surname}`,
      email: user.email,
      category: user.role,
      password: initialPassword
    };

  } catch (error) {
    console.error('Error generando contraseña para usuario:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Resetea la contraseña de un usuario a la inicial
 */
export async function resetToInitialPassword(userId: string) {
  return await generatePasswordForUser(userId);
}

/**
 * Verifica qué usuarios necesitan contraseña
 */
export async function getUsersWithoutPassword() {
  try {
    const { data: users, error } = await supabase
    .from('users')
    .select(`
      id,
      name,
      surname,
      email,
      dni,
      birth_year,
      role
    `)
    .not('email', 'is', null)
    .not('birth_year', 'is', null)
    .not('dni', 'is', null)
    .is('password_hash', null);

    if (error) {
      throw new Error(`Error obteniendo usuarios: ${error.message}`);
    }

    const allowedRoles = ['user', 'admin'];
    
    const eligibleUsers = (users || []).filter(user => 
      allowedRoles.includes(user.role || '')
    );

    return {
      success: true,
      total: eligibleUsers.length,
      users: eligibleUsers
    };

  } catch (error) {
    console.error('Error obteniendo usuarios sin contraseña:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

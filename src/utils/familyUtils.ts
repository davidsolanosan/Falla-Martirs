import { User, Family } from '../types';

// Función para generar familias automáticamente basadas en la dirección
export function generateFamiliesFromUsers(users: User[]): Family[] {
  console.log('=== DEBUG GENERATE FAMILIES ===');
  console.log('Total usuarios:', users.length);
  
  // Agrupar usuarios por dirección exacta
  const usersByAddress = users.reduce((groups, user) => {
    const address = user.address || ''; // Usar address en lugar de direccion
    if (!address) return groups;
    
    if (!groups[address]) {
      groups[address] = [];
    }
    groups[address].push(user);
    return groups;
  }, {} as Record<string, User[]>);

  console.log('Direcciones encontradas:', Object.keys(usersByAddress));
  console.log('Grupos por dirección:', Object.entries(usersByAddress).map(([addr, users]) => ({ address: addr, count: users.length })));

  // Generar familias para cada grupo de usuarios con misma dirección
  const families: Family[] = [];
  
  Object.entries(usersByAddress).forEach(([address, addressUsers]) => {
    if (addressUsers.length > 0) {
      const family = generateFamilyFromUsers(addressUsers, address);
      families.push(family);
    }
  });

  console.log('Familias generadas total:', families.length);
  console.log('=== FIN DEBUG GENERATE FAMILIES ===');

  return families;
}

// Función para extraer año de nacimiento de forma robusta
function extractBirthYear(birthYearStr: string): number {
  if (!birthYearStr) return 0;
  
  // Limpiar el string
  const cleanStr = birthYearStr.toString().trim();
  
  // Si es un número de 4 dígitos, usarlo directamente
  if (/^\d{4}$/.test(cleanStr)) {
    const year = parseInt(cleanStr);
    // Validar que sea un año razonable (1900-2025)
    if (year >= 1900 && year <= 2025) {
      return year;
    }
    return 0;
  }
  
  // Si contiene '/', split por /
  if (cleanStr.includes('/')) {
    const parts = cleanStr.split('/');
    if (parts.length >= 3) {
      const year = parseInt(parts[parts.length - 1]);
      if (year >= 1900 && year <= 2025) {
        return year;
      }
    }
  }
  
  // Si contiene '-', split por -
  if (cleanStr.includes('-')) {
    const parts = cleanStr.split('-');
    if (parts.length >= 3) {
      const year = parseInt(parts[parts.length - 1]);
      if (year >= 1900 && year <= 2025) {
        return year;
      }
    }
  }
  
  // Intentar parsear directamente como último resort
  const year = parseInt(cleanStr);
  if (year >= 1900 && year <= 2025) {
    return year;
  }
  
  return 0; // Si no se puede determinar, retornar 0
}

// Función para generar una familia a partir de usuarios con misma dirección
function generateFamilyFromUsers(users: User[], address: string): Family {
  console.log('=== DEBUG FAMILIA ===');
  console.log('Dirección:', address);
  console.log('Usuarios en esta dirección:', users.length);
  console.log('Datos de usuarios:', users.map(u => ({
    name: u.name,
    surname: u.surname,
    birth_year: u.birth_year
  })));
  
  // Filtrar adultos (mayores de 18 años)
  const adults = users.filter(user => {
    if (!user.birth_year) return false;
    
    const birthYear = extractBirthYear(user.birth_year);
    if (birthYear === 0) {
      console.log('Usuario con fecha inválida:', user.name, user.birth_year);
      return false;
    }
    
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    
    return age >= 18;
  });

  console.log('Adultos encontrados:', adults.length);
  console.log('Datos de adultos:', adults.map(a => ({
    name: a.name,
    surname: a.surname,
    birth_year: a.birth_year,
    calculatedAge: new Date().getFullYear() - extractBirthYear(a.birth_year)
  })));

  // Ordenar adultos por edad (mayor a menor)
  adults.sort((a, b) => {
    const getBirthYear = (user: User) => {
      if (!user.birth_year) return 0;
      return extractBirthYear(user.birth_year);
    };
    
    return getBirthYear(b) - getBirthYear(a);
  });

  // Extraer apellidos para el nombre de la familia según nueva lógica
  let familyName = '';
  
  if (users.length === 1) {
    // Caso 1: 1 solo miembro (cualquier edad)
    const user = users[0];
    const fullSurname = user.surname || '';
    const surnames = extractTwoSurnames(fullSurname);
    familyName = surnames;
    console.log('1 miembro - Nombre familia:', familyName);
    
  } else {
    // Caso 2: 2+ miembros
    
    if (adults.length === 1) {
      // Solo 1 adulto: ambos apellidos de ese adulto
      const adult = adults[0];
      const fullSurname = adult.surname || '';
      const surnames = extractTwoSurnames(fullSurname);
      familyName = surnames;
      console.log('2+ miembros, 1 adulto - Nombre familia:', familyName);
      
    } else if (adults.length >= 2) {
      // 2+ adultos: apellidos de 2 adultos mayores, hombre primero
      const sortedAdults = sortAdultsByGenderAndAge(adults);
      console.log('Adultos ordenados (hombre primero):', sortedAdults.map(a => ({
        name: a.name,
        surname: a.surname,
        sexe: a.sexe,
        age: new Date().getFullYear() - extractBirthYear(a.birth_year)
      })));
      
      // Primer adulto (hombre mayor)
      const firstAdult = sortedAdults[0];
      const surname1 = extractFirstSurname(firstAdult.surname || '');
      
      // Segundo adulto (siguiente mayor)
      const secondAdult = sortedAdults[1];
      const surname2 = extractFirstSurname(secondAdult.surname || '');
      
      if (surname1 && surname2) {
        familyName = `${surname1} ${surname2}`;
      } else if (surname1) {
        familyName = surname1;
      }
      
      console.log('2+ adultos - Nombre familia:', familyName);
    }
  }
  
  // Si no se pudo generar nombre, usar "Familia" como fallback
  if (!familyName.trim()) {
    familyName = 'Familia';
    console.log('Fallback - Nombre familia:', familyName);
  }

  console.log('Nombre final de la familia:', familyName);
  console.log('=== FIN DEBUG FAMILIA ===');

  // IDs de todos los miembros
  const memberIds = users ? users.map(user => user.id) : [];
  
  // IDs de representantes (todos los adultos)
  const representativeIds = adults ? adults.map(user => user.id) : [];

  return {
    id: '', // Se generará en la base de datos
    name: familyName,
    address: address,
    phone: '', // Se puede asignar más tarde
    representativeIds,
    members: memberIds,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// Función para extraer el primer apellido
function extractFirstSurname(fullSurname: string): string {
  if (!fullSurname) return '';
  
  // Dividir por espacios y tomar la primera palabra
  const parts = fullSurname.trim().split(/\s+/);
  return parts[0] || '';
}

// Función para extraer dos apellidos completos
function extractTwoSurnames(fullSurname: string): string {
  if (!fullSurname) return '';
  
  // Dividir por espacios y tomar las primeras dos palabras
  const parts = fullSurname.trim().split(/\s+/);
  
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1]}`;
  } else if (parts.length === 1) {
    return parts[0];
  }
  
  return '';
}

// Función para ordenar adultos: hombres primero por edad, luego mujeres por edad
function sortAdultsByGenderAndAge(adults: User[]): User[] {
  return adults.sort((a, b) => {
    // Primero: priorizar hombres (SEXE=M)
    const aIsMale = (a.sexe || '').toUpperCase() === 'M';
    const bIsMale = (b.sexe || '').toUpperCase() === 'M';
    
    if (aIsMale && !bIsMale) return -1;  // Hombre primero
    if (!aIsMale && bIsMale) return 1;   // Mujer después
    
    // Si mismo género, ordenar por edad (mayor primero)
    const getBirthYear = (user: User) => {
      if (!user.birth_year) return 0;
      return extractBirthYear(user.birth_year);
    };
    
    return getBirthYear(a) - getBirthYear(b); // Mayor edad primero
  });
}

// Función para actualizar familias existentes con nuevos usuarios
export function updateFamiliesWithNewUsers(existingFamilies: Family[], newUsers: User[]): Family[] {
  // Generar familias de todos los usuarios (existentes + nuevos)
  const allUsers = [...newUsers];
  const generatedFamilies = generateFamiliesFromUsers(allUsers);
  
  // Combinar familias existentes con generadas
  const familyMap = new Map<string, Family>();
  
  // Añadir familias existentes
  existingFamilies.forEach(family => {
    familyMap.set(family.address, family);
  });
  
  // Añadir o actualizar familias generadas
  generatedFamilies.forEach(family => {
    const existing = familyMap.get(family.address);
    if (existing) {
      // Actualizar familia existente con nuevos miembros
      existing.members = [...new Set([...(existing.members || []), ...family.members])];
      existing.representativeIds = [...new Set([...(existing.representativeIds || []), ...family.representativeIds])];
      existing.updated_at = new Date().toISOString();
    } else {
      // Nueva familia
      familyMap.set(family.address, family);
    }
  });
  
  return Array.from(familyMap.values());
}

// Función para validar si una familia necesita actualización
export function needsFamilyUpdate(family: Family, users: User[]): boolean {
  // Obtener usuarios actuales con la misma dirección
  const currentUsers = users.filter(user => user.address === family.address); // Usar address
  const currentMemberIds = new Set(currentUsers.map(user => user.id));
  
  // Verificar si todos los miembros actuales están en la familia
  const familyMemberIds = new Set(family.members);
  
  // Si hay diferencias, necesita actualización
  return (
    currentMemberIds.size !== familyMemberIds.size ||
    [...currentMemberIds].some(id => !familyMemberIds.has(id)) ||
    [...familyMemberIds].some(id => !currentMemberIds.has(id))
  );
}

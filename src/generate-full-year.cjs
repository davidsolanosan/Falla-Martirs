const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ojhebvlzhoeaabkbifvy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaGVidmx6aG9lYWFia2JpZnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMTkyNzcsImV4cCI6MjA5MDY5NTI3N30.etDN7WIrYUg4Af7DFyQQDlv4Yb0QWub5qhSbgvDQLxo'
);

function getFirstSaturdayOfYear(year) {
  const april1 = new Date(year, 3, 1); // 3 = abril (0-indexed)
  const dayOfWeek = april1.getDay();
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
  const firstSaturday = new Date(april1);
  firstSaturday.setDate(april1.getDate() + daysUntilSaturday);
  return firstSaturday;
}

function isSaturday(date) {
  return date.getDay() === 6; // 6 = sábado
}

function isDecemberException(date) {
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();
  
  // Solo primeros 2 sábados de diciembre
  if (month === 12) {
    const firstDayOfMonth = new Date(date.getFullYear(), 11, 1);
    const firstSaturday = getFirstSaturdayOfMonth(date.getFullYear(), 11);
    const secondSaturday = new Date(firstSaturday);
    secondSaturday.setDate(firstSaturday.getDate() + 7);
    
    return date.getTime() === firstSaturday.getTime() || 
           date.getTime() === secondSaturday.getTime();
  }
  return false;
}

function getFirstSaturdayOfMonth(year, month) {
  const firstDay = new Date(year, month, 1);
  const dayOfWeek = firstDay.getDay();
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
  const firstSaturday = new Date(firstDay);
  firstSaturday.setDate(firstDay.getDate() + daysUntilSaturday);
  return firstSaturday;
}

function generateLotteryDates(year) {
  const dates = [];
  const currentDate = new Date(year, 3, 1); // 1 de abril
  
  // Fase 1: De primer sábado de abril hasta 6 de enero (excluido)
  const endPhase1 = new Date(year + 1, 0, 6); // 6 de enero del siguiente año
  
  while (currentDate < endPhase1) {
    if (isSaturday(currentDate)) {
      // Excepción: diciembre solo primeros 2 sábados
      if (currentDate.getMonth() + 1 === 12) {
        if (isDecemberException(currentDate)) {
          dates.push(new Date(currentDate));
        }
      } else {
        dates.push(new Date(currentDate));
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Fase 2: Del sábado después del 6 de enero hasta fin de marzo
  const startPhase2 = new Date(year + 1, 0, 7); // 7 de enero
  const endPhase2 = new Date(year + 1, 3, 31); // 31 de marzo
  currentDate.setTime(startPhase2.getTime());
  
  while (currentDate <= endPhase2) {
    if (isSaturday(currentDate)) {
      dates.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

function formatDate(date) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function generateLotteryName(date, index) {
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  
  return `Sorteo ${index + 1} - ${day} de ${month}`;
}

async function generateFullYearLotteries() {
  console.log('Generando todos los sorteos del año fallero...\n');
  
  try {
    const year = 2025;
    const lotteryDates = generateLotteryDates(year);
    
    console.log(`Total de sorteos generados: ${lotteryDates.length}`);
    console.log('Rango: Abril 2025 - Marzo 2026\n');
    
    // Generar datos para insertar
    const lotteriesToInsert = lotteryDates.map((date, index) => ({
      date: formatDate(date),
      name: generateLotteryName(date, index),
      special: false,
      lottery_price: 0.50,
      primitive_price: 0.30,
      donation_price: 0.20,
      prize_amount: Math.floor(Math.random() * 1500) + 100 // Premios aleatorios entre 100-1600
    }));
    
    // Mostrar primeros 10 ejemplos
    console.log('Primeros 10 sorteos:');
    lotteriesToInsert.slice(0, 10).forEach((lottery, i) => {
      console.log(`${i + 1}. ${lottery.date} - ${lottery.name}`);
    });
    
    console.log('\nÚltimos 5 sorteos:');
    lotteriesToInsert.slice(-5).forEach((lottery, i) => {
      console.log(`${lotteriesToInsert.length - 4 + i}. ${lottery.date} - ${lottery.name}`);
    });
    
    // Generar SQL para insertar
    console.log('\n--- SQL PARA INSERTAR ---');
    console.log('-- Borrar sorteos existentes (opcional)');
    console.log('DELETE FROM lottery_dates WHERE date >= \'2025-04-01\' AND date <= \'2026-03-31\';');
    console.log('\n-- Insertar nuevos sorteos');
    
    lotteriesToInsert.forEach(lottery => {
      console.log(`INSERT INTO lottery_dates (date, name, special, lottery_price, primitive_price, donation_price, prize_amount) VALUES ('${lottery.date}', '${lottery.name}', ${lottery.special}, ${lottery.lottery_price}, ${lottery.primitive_price}, ${lottery.donation_price}, ${lottery.prize_amount});`);
    });
    
    // Opcional: Insertar directamente en la base de datos
    console.log('\n¿Deseas insertar directamente en la base de datos? (s/n)');
    
  } catch (error) {
    console.error('Error generando sorteos:', error.message);
  }
}

generateFullYearLotteries();

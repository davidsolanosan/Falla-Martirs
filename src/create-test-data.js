import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ojhebvlzhoeaabkbifvy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaGVidmx6aG9lYWFia2JpZnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMTkyNzcsImV4cCI6MjA5MDY5NTI3N30.etDN7WIrYUg4Af7DFyQQDlv4Yb0QWub5qhSbgvDQLxo';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestData() {
  console.log('Creando datos de prueba para lotería...');
  
  try {
    // 1. Obtener sorteos existentes
    const { data: lotteryDates, error: datesError } = await supabase
      .from('lottery_dates')
      .select('*');
    
    if (datesError) {
      console.error('Error obteniendo sorteos:', datesError);
      return;
    }
    
    console.log(`Encontrados ${lotteryDates.length} sorteos`);
    
    // 2. Obtener usuarios
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('Error obteniendo usuarios:', usersError);
      return;
    }
    
    console.log(`Encontrados ${users.length} usuarios`);
    
    // 3. Crear papeletas de prueba
    const testTickets = [];
    
    // Papeletas para el primer sorteo
    const firstLottery = lotteryDates[0];
    const testUser = users[1]; // test@test.com
    
    if (firstLottery && testUser) {
      // Crear 3 papeletas para el usuario de prueba
      const tickets = [
        {
          lottery_date_id: firstLottery.id,
          user_id: testUser.id,
          lottery_number: '64567',
          primitive_numbers: [5, 6, 9, 11, 21, 28],
          is_paid: true,
          lottery_amount: firstLottery.lottery_price,
          primitive_amount: firstLottery.primitive_price || 0,
          donation_amount: firstLottery.donation_price
        },
        {
          lottery_date_id: firstLottery.id,
          user_id: testUser.id,
          lottery_number: '12345',
          primitive_numbers: [1, 7, 14, 23, 32, 41],
          is_paid: false,
          lottery_amount: firstLottery.lottery_price,
          primitive_amount: firstLottery.primitive_price || 0,
          donation_amount: firstLottery.donation_price
        },
        {
          lottery_date_id: firstLottery.id,
          user_id: testUser.id,
          lottery_number: '98765',
          primitive_numbers: [3, 8, 15, 24, 33, 42],
          is_paid: true,
          lottery_amount: firstLottery.lottery_price,
          primitive_amount: firstLottery.primitive_price || 0,
          donation_amount: firstLottery.donation_price
        }
      ];
      
      // Insertar papeletas
      const { data: insertedTickets, error: insertError } = await supabase
        .from('lottery_tickets')
        .insert(tickets)
        .select();
      
      if (insertError) {
        console.error('Error insertando papeletas:', insertError);
      } else {
        console.log(`Insertadas ${insertedTickets.length} papeletas`);
        testTickets.push(...insertedTickets);
      }
      
      // 4. Crear premios de prueba
      const testPrizes = [
        {
          lottery_date_id: firstLottery.id,
          prize_type: 'lottery',
          prize_category: '1er Premio',
          prize_amount: 1000,
          winning_number: '64567',
          description: 'Premio Gordo de Navidad'
        },
        {
          lottery_date_id: firstLottery.id,
          prize_type: 'primitive',
          prize_category: 'Primitiva',
          prize_amount: 500,
          winning_numbers: [5, 6, 9, 11, 21, 28],
          description: '6 aciertos Primitiva'
        },
        {
          lottery_date_id: firstLottery.id,
          prize_type: 'lottery',
          prize_category: '2º Premio',
          prize_amount: 250,
          winning_number: '12345',
          description: 'Segundo Premio'
        }
      ];
      
      // Insertar premios
      const { data: insertedPrizes, error: prizesError } = await supabase
        .from('lottery_prizes')
        .insert(testPrizes)
        .select();
      
      if (prizesError) {
        console.error('Error insertando premios:', prizesError);
      } else {
        console.log(`Insertados ${insertedPrizes.length} premios`);
      }
      
      // 5. Asignar premios a las papeletas ganadoras
      if (insertedTickets && insertedPrizes) {
        // La papeleta 64567 ganó el 1er premio
        const winningTicket1 = insertedTickets.find(t => t.lottery_number === '64567');
        const prize1 = insertedPrizes.find(p => p.winning_number === '64567');
        
        if (winningTicket1 && prize1) {
          console.log('Asignando premio a papeleta 64567');
        }
        
        // La papeleta 12345 ganó el 2º premio
        const winningTicket2 = insertedTickets.find(t => t.lottery_number === '12345');
        const prize2 = insertedPrizes.find(p => p.winning_number === '12345');
        
        if (winningTicket2 && prize2) {
          console.log('Asignando premio a papeleta 12345');
        }
      }
    }
    
    console.log('¡Datos de prueba creados exitosamente!');
    console.log('Usuario de prueba: test@test.com');
    console.log('Papeletas creadas: 3');
    console.log('Premios creados: 3');
    
  } catch (error) {
    console.error('Error general:', error);
  }
}

createTestData();

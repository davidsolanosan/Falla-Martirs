import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ojhebvlzhoeaabkbifvy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaGVidmx6aG9lYWFia2JpZnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMTkyNzcsImV4cCI6MjA5MDY5NTI3N30.etDN7WIrYUg4Af7DFyQQDlv4Yb0QWub5qhSbgvDQLxo';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkLotteryStructure() {
  console.log('🔍 Verificando estructura de tablas de lotería...');
  
  try {
    // 1. Verificar tabla lottery_dates
    console.log('\n📅 TABLA lottery_dates:');
    const { data: dates, error: datesError } = await supabase
      .from('lottery_dates')
      .select('*')
      .limit(5);
    
    if (datesError) {
      console.error('❌ Error en lottery_dates:', datesError);
    } else {
      console.log('✅ lottery_dates - OK');
      dates.forEach(date => {
        console.log(`  📋 ${date.date}: ${date.name} (${date.special ? 'Especial' : 'Ordinario'})`);
      });
    }
    
    // 2. Verificar tabla lottery_tickets
    console.log('\n🎫 TABLA lottery_tickets:');
    const { data: tickets, error: ticketsError } = await supabase
      .from('lottery_tickets')
      .select('*')
      .limit(5);
    
    if (ticketsError) {
      console.error('❌ Error en lottery_tickets:', ticketsError);
    } else {
      console.log('✅ lottery_tickets - OK');
      console.log(`  🎫 Total papeletas: ${tickets.length}`);
      if (tickets.length > 0) {
        console.log('  📋 Estructura:', Object.keys(tickets[0]));
      }
    }
    
    // 3. Verificar tabla lottery_prizes
    console.log('\n🏆 TABLA lottery_prizes:');
    const { data: prizes, error: prizesError } = await supabase
      .from('lottery_prizes')
      .select('*')
      .limit(5);
    
    if (prizesError) {
      console.error('❌ Error en lottery_prizes:', prizesError);
    } else {
      console.log('✅ lottery_prizes - OK');
      console.log(`  🏆 Total premios: ${prizes.length}`);
      if (prizes.length > 0) {
        console.log('  📋 Estructura:', Object.keys(prizes[0]));
      }
    }
    
    // 4. Verificar tabla users (para referencia)
    console.log('\n👥 TABLA users:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .limit(3);
    
    if (usersError) {
      console.error('❌ Error en users:', usersError);
    } else {
      console.log('✅ users - OK');
      users.forEach(user => {
        console.log(`  👤 ${user.email}: ${user.role}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkLotteryStructure();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ojhebvlzhoeaabkbifvy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaGVidmx6aG9lYWFia2JpZnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMTkyNzcsImV4cCI6MjA5MDY5NTI3N30.etDN7WIrYUg4Af7DFyQQDlv4Yb0QWub5qhSbgvDQLxo';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDetailedStructure() {
  console.log('=== ANÁLISIS DETALLADO DE ESTRUCTURA ===');
  
  try {
    // 1. Estructura de lottery_tickets
    console.log('\n1. ESTRUCTURA lottery_tickets:');
    console.log('Intentando obtener columnas...');
    
    // Intentar insertar un registro temporal para ver la estructura
    const testTicket = {
      lottery_date_id: 'test-id',
      user_id: 'test-user',
      lottery_number: '12345',
      primitive_numbers: [1, 2, 3, 4, 5, 6],
      is_paid: false,
      lottery_amount: 0.50,
      primitive_amount: 0.30,
      donation_amount: 0.20
    };
    
    console.log('Campos esperados en lottery_tickets:');
    console.log(Object.keys(testTicket));
    
    // Verificar si podemos consultar con estos campos
    const { data: ticketTest, error: ticketError } = await supabase
      .from('lottery_tickets')
      .select('lottery_number, primitive_numbers, is_paid, lottery_amount, primitive_amount, donation_amount')
      .limit(1);
    
    if (ticketError) {
      console.log('Error al consultar campos específicos:', ticketError.message);
      console.log('Posiblemente algunos campos no existen');
    } else {
      console.log('Consulta exitosa - Los campos existen');
    }
    
    // 2. Estructura de lottery_prizes
    console.log('\n2. ESTRUCTURA lottery_prizes:');
    const testPrize = {
      lottery_ticket_id: 'test-ticket-id',
      prize_type: 'lottery',
      prize_amount: 1000,
      description: 'Premio de prueba',
      is_won: false
    };
    
    console.log('Campos esperados en lottery_prizes:');
    console.log(Object.keys(testPrize));
    
    // Verificar si podemos consultar con estos campos
    const { data: prizeTest, error: prizeError } = await supabase
      .from('lottery_prizes')
      .select('prize_type, prize_amount, description, is_won')
      .limit(1);
    
    if (prizeError) {
      console.log('Error al consultar campos específicos:', prizeError.message);
      console.log('Posiblemente algunos campos no existen');
    } else {
      console.log('Consulta exitosa - Los campos existen');
    }
    
    // 3. Verificar interfaces en TypeScript
    console.log('\n3. VERIFICANDO INTERFACES TYPESCRIPT:');
    
    // Importar y revisar las interfaces definidas
    console.log('Interfaces definidas en supabase.ts...');
    
  } catch (error) {
    console.error('Error en verificación:', error);
  }
}

checkDetailedStructure();

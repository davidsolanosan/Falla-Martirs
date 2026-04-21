import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ojhebvlzhoeaabkbifvy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaGVidmx6aG9lYWFia2JpZnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMTkyNzcsImV4cCI6MjA5MDY5NTI3N30.etDN7WIrYUg4Af7DFyQQDlv4Yb0QWub5qhSbgvDQLxo';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkLotteryDatesStructure() {
  console.log('🔍 Verificando estructura detallada de lottery_dates...');
  
  try {
    // Obtener un registro específico para ver todos los campos
    const { data: dates, error } = await supabase
      .from('lottery_dates')
      .select('*')
      .limit(3);
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log('✅ Estructura de lottery_dates:');
    console.log(`📊 Total registros: ${dates.length}`);
    
    if (dates.length > 0) {
      console.log('\n📋 Campos encontrados:');
      const fields = Object.keys(dates[0]);
      fields.forEach(field => {
        console.log(`  🔧 ${field}: ${typeof dates[0][field]} = ${dates[0][field]}`);
      });
      
      console.log('\n📋 Datos de ejemplo:');
      dates.forEach((date, index) => {
        console.log(`\n🎫 Sorteo ${index + 1}:`);
        console.log(`  📅 Fecha: ${date.date}`);
        console.log(`  📝 Nombre: ${date.name}`);
        console.log(`  ⭐ Especial: ${date.special}`);
        console.log(`  💰 Precio Lotería: ${date.lottery_price || 'NO EXISTE'}`);
        console.log(`  🎯 Precio Primitiva: ${date.primitive_price || 'NO EXISTE'}`);
        console.log(`  🎁 Precio Donación: ${date.donation_price || 'NO EXISTE'}`);
        console.log(`  🆔 ID: ${date.id}`);
        console.log(`  📅 Creado: ${date.created_at}`);
        console.log(`  📅 Actualizado: ${date.updated_at}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkLotteryDatesStructure();

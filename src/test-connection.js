import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase (misma que en src/lib/supabase.ts)
const supabaseUrl = 'https://ojhebvlzhoeaabkbifvy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaGVidmx6aG9lYWFia2JpZnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMTkyNzcsImV4cCI6MjA5MDY5NTI3N30.etDN7WIrYUg4Af7DFyQQDlv4Yb0QWub5qhSbgvDQLxo';

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Probar conexión
async function testConnection() {
  console.log('🔍 Probando conexión con Supabase...');
  
  try {
    // Probar conexión básica
    const { data, error } = await supabase.from('lottery_dates').select('count').single();
    
    if (error) {
      console.error('❌ Error de conexión:', error);
      return false;
    }
    
    console.log('✅ Conexión exitosa');
    console.log('📊 Total fechas de lotería:', data);
    return true;
    
  } catch (err) {
    console.error('❌ Error general:', err);
    return false;
  }
}

// Probar inserción
async function testInsert() {
  console.log('🔍 Probando inserción...');
  
  try {
    const { data, error } = await supabase
      .from('lottery_dates')
      .insert({
        date: '2025-04-05',
        name: 'Lotería de Prueba',
        special: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error de inserción:', error);
      return false;
    }
    
    console.log('✅ Inserción exitosa:', data);
    return true;
    
  } catch (err) {
    console.error('❌ Error general en inserción:', err);
    return false;
  }
}

// Ejutar pruebas
console.log('🚀 Iniciando pruebas de conexión...');
testConnection().then(success => {
  if (success) {
    testInsert();
  } else {
    console.log('❌ La conexión básica falló, omitiendo inserción');
  }
});

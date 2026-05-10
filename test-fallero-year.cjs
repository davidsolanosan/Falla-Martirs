const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ojhebvlzhoeaabkbifvy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaGVidmx6aG9lYWFia2JpZnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMTkyNzcsImV4cCI6MjA5MDY5NTI3N30.etDN7WIrYUg4Af7DFyQQDlv4Yb0QWub5qhSbgvDQLxo'
);

function getLotteryDatesByType(lotteryDates, selectedYear, type) {
  return lotteryDates.filter((ld) => {
    const date = new Date(ld.date);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0 = enero, 2 = marzo
    const day = date.getDate();
    
    // Lógica del año fallero: 20 de marzo al 19 de marzo del año siguiente
    if (selectedYear === 2026) {
      // Año fallero 2026: 20/03/2026 - 19/03/2027
      if (year === 2026) {
        // Del 20/03/2026 al 31/12/2026
        return (month > 2 || (month === 2 && day >= 20)) && ld.lottery_type === type;
      } else if (year === 2027) {
        // Del 01/01/2027 al 19/03/2027
        return (month < 2 || (month === 2 && day <= 19)) && ld.lottery_type === type;
      }
    }
    
    // Para otros años, usar año calendario como fallback
    return date.getFullYear() === selectedYear && ld.lottery_type === type;
  });
}

async function testFalleroYear() {
  try {
    console.log('=== TEST AÑO FALLERO ===');
    
    // Get all lottery dates
    const { data: allDates, error } = await supabase
      .from('lottery_dates')
      .select('*');
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('Total dates:', allDates?.length || 0);
    
    // Test año calendario vs año fallero
    const ordinaryCalendar2026 = allDates?.filter(d => 
      new Date(d.date).getFullYear() === 2026 && d.lottery_type === 'ordinary'
    ) || [];
    
    const ordinaryFallero2026 = getLotteryDatesByType(allDates, 2026, 'ordinary');
    
    console.log('\n=== COMPARACIÓN ===');
    console.log('Ordinarios año calendario 2026:', ordinaryCalendar2026.length);
    console.log('Ordinarios año fallero 2026:', ordinaryFallero2026.length);
    
    // Show some examples
    console.log('\n=== EJEMPLOS AÑO FALLERO 2026 ===');
    ordinaryFallero2026.slice(0, 10).forEach(date => {
      console.log(`${date.date} - ${date.lottery_type}`);
    });
    
    // Test other types
    const christmasFallero2026 = getLotteryDatesByType(allDates, 2026, 'christmas');
    const childFallero2026 = getLotteryDatesByType(allDates, 2026, 'child');
    const hortaFallero2026 = getLotteryDatesByType(allDates, 2026, 'horta');
    
    console.log('\n=== RESUMEN AÑO FALLERO 2026 ===');
    console.log('Ordinarios:', ordinaryFallero2026.length);
    console.log('Navidad:', christmasFallero2026.length);
    console.log('Niño:', childFallero2026.length);
    console.log('Horta Nord:', hortaFallero2026.length);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testFalleroYear();

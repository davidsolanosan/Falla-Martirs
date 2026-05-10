const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ojhebvlzhoeaabkbifvy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaGVidmx6aG9lYWFia2JpZnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMTkyNzcsImV4cCI6MjA5MDY5NTI3N30.etDN7WIrYUg4Af7DFyQQDlv4Yb0QWub5qhSbgvDQLxo'
);

function getLotteryDatesByType(lotteryDates, selectedYear, type) {
  return lotteryDates.filter((ld) => {
    const date = new Date(ld.date);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0 = enero, 2 = marzo, 3 = abril
    const day = date.getDate();
    
    // Lógica del año fallero: 1 de abril al 30 de marzo del año siguiente
    if (selectedYear === 2026) {
      // Año fallero 2026: 01/04/2026 - 30/03/2027
      if (year === 2026) {
        // Del 01/04/2026 al 31/12/2026
        return (month > 3 || (month === 3 && day >= 1)) && ld.lottery_type === type;
      } else if (year === 2027) {
        // Del 01/01/2027 al 30/03/2027
        return (month < 3 || (month === 2 && day <= 30)) && ld.lottery_type === type;
      }
    }
    
    // Para otros años, usar año calendario como fallback
    return date.getFullYear() === selectedYear && ld.lottery_type === type;
  });
}

async function testNewFalleroYear() {
  try {
    console.log('=== TEST NUEVO AÑO FALLERO (1 ABRIL - 30 MARZO) ===');
    
    // Get all lottery dates
    const { data: allDates, error } = await supabase
      .from('lottery_dates')
      .select('*');
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('Total dates:', allDates?.length || 0);
    
    // Test año fallero 2026
    const ordinaryFallero2026 = getLotteryDatesByType(allDates, 2026, 'ordinary');
    const christmasFallero2026 = getLotteryDatesByType(allDates, 2026, 'christmas');
    const childFallero2026 = getLotteryDatesByType(allDates, 2026, 'child');
    const hortaFallero2026 = getLotteryDatesByType(allDates, 2026, 'horta');
    
    console.log('\n=== AÑO FALLERO 2026 (01/04/2026 - 30/03/2027) ===');
    console.log('Ordinarios:', ordinaryFallero2026.length);
    console.log('Navidad:', christmasFallero2026.length);
    console.log('Niño:', childFallero2026.length);
    console.log('Horta Nord:', hortaFallero2026.length);
    console.log('Total año fallero 2026:', ordinaryFallero2026.length + christmasFallero2026.length + childFallero2026.length + hortaFallero2026.length);
    
    // Show some examples
    console.log('\n=== EJEMPLOS AÑO FALLERO 2026 ===');
    ordinaryFallero2026.slice(0, 10).forEach(date => {
      console.log(`${date.date} - ${date.lottery_type}`);
    });
    
    // Show dates that are now included/excluded
    console.log('\n=== CAMBIOS VS ANTERIOR (20/03 - 19/03) ===');
    const criticalDates = [
      '2026-03-20', '2026-03-21', '2026-03-31', '2026-04-01',
      '2027-03-19', '2027-03-20', '2027-03-21', '2027-03-30', '2027-03-31'
    ];
    
    criticalDates.forEach(dateStr => {
      const date = allDates?.find(d => d.date === dateStr);
      if (date) {
        const isInNewFallero = getLotteryDatesByType([date], 2026, date.lottery_type).length > 0;
        console.log(`${date.date} - ${date.lottery_type} - Nuevo Fallero 2026: ${isInNewFallero ? '✅' : '❌'}`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testNewFalleroYear();

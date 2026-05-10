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

async function debugLotteryCount() {
  try {
    console.log('=== DEBUG CONTEO DE LOTERÍAS ===');
    
    // Get all lottery dates
    const { data: allDates, error } = await supabase
      .from('lottery_dates')
      .select('*');
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('Total dates en BD:', allDates?.length || 0);
    
    // Contar por tipo (total general)
    const totalByType = {};
    allDates?.forEach(date => {
      if (!totalByType[date.lottery_type]) {
        totalByType[date.lottery_type] = 0;
      }
      totalByType[date.lottery_type]++;
    });
    
    console.log('\n=== TOTAL GENERAL POR TIPO ===');
    console.log('Ordinarios:', totalByType['ordinary'] || 0);
    console.log('Navidad:', totalByType['christmas'] || 0);
    console.log('Niño:', totalByType['child'] || 0);
    console.log('Horta Nord:', totalByType['horta'] || 0);
    console.log('Total general:', Object.values(totalByType).reduce((a, b) => a + b, 0));
    
    // Contar por año fallero 2026
    const ordinaryFallero2026 = getLotteryDatesByType(allDates, 2026, 'ordinary');
    const christmasFallero2026 = getLotteryDatesByType(allDates, 2026, 'christmas');
    const childFallero2026 = getLotteryDatesByType(allDates, 2026, 'child');
    const hortaFallero2026 = getLotteryDatesByType(allDates, 2026, 'horta');
    
    console.log('\n=== AÑO FALLERO 2026 ===');
    console.log('Ordinarios:', ordinaryFallero2026.length);
    console.log('Navidad:', christmasFallero2026.length);
    console.log('Niño:', childFallero2026.length);
    console.log('Horta Nord:', hortaFallero2026.length);
    console.log('Total año fallero 2026:', ordinaryFallero2026.length + christmasFallero2026.length + childFallero2026.length + hortaFallero2026.length);
    
    // Mostrar todas las fechas ordinarias con detalles
    console.log('\n=== DETALLE ORDINARIOS ===');
    allDates?.filter(d => d.lottery_type === 'ordinary').forEach((date, index) => {
      const dateObj = new Date(date.date);
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth();
      const day = dateObj.getDate();
      const isInFallero2026 = getLotteryDatesByType([date], 2026, 'ordinary').length > 0;
      
      console.log(`${index + 1}. ${date.date} - ${date.lottery_type} - Año: ${year} - Fallero 2026: ${isInFallero2026 ? '✅' : '❌'}`);
    });
    
    // Mostrar fechas que podrían estar fuera del rango
    console.log('\n=== ORDINARIOS FUERA DEL AÑO FALLERO 2026 ===');
    const outOfRange = allDates?.filter(d => {
      if (d.lottery_type !== 'ordinary') return false;
      return getLotteryDatesByType([d], 2026, 'ordinary').length === 0;
    }) || [];
    
    outOfRange.forEach(date => {
      const dateObj = new Date(date.date);
      console.log(`${date.date} - ${date.lottery_type} - ${dateObj.toLocaleDateString()}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugLotteryCount();

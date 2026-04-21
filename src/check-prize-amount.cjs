const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ojhebvlzhoeaabkbifvy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaGVidmx6aG9lYWFia2JpZnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMTkyNzcsImV4cCI6MjA5MDY5NTI3N30.etDN7WIrYUg4Af7DFyQQDlv4Yb0QWub5qhSbgvDQLxo'
);

async function checkPrizeAmount() {
  console.log('🔍 Verificando campo prize_amount en lottery_dates...\n');
  
  try {
    // Consultar un registro y ver qué campos devuelve
    console.log('🔄 Consultando sorteos...\n');
    const { data: lotteries, error: lotteriesError } = await supabase
      .from('lottery_dates')
      .select('*')
      .limit(3);
    
    if (lotteriesError) {
      console.log('❌ Error consultando sorteos:', lotteriesError.message);
    } else if (lotteries && lotteries.length > 0) {
      console.log('📋 Campos encontrados en lottery_dates:');
      console.log(Object.keys(lotteries[0]));
      
      const hasPrizeAmount = 'prize_amount' in lotteries[0];
      console.log(`\n🏆 ¿Tiene prize_amount? ${hasPrizeAmount ? '✅ SÍ' : '❌ NO'}`);
      
      if (hasPrizeAmount) {
        console.log(`💰 Valor de prize_amount: ${lotteries[0].prize_amount}`);
      }
    }
    
    // Verificar datos actuales
    console.log('\n📊 Verificando datos actuales...\n');
    const { data: allLotteries, error: allError } = await supabase
      .from('lottery_dates')
      .select('id, name, date, prize_amount')
      .order('date');
    
    if (allError) {
      console.log('❌ Error consultando todos los sorteos:', allError.message);
    } else {
      console.log('🎫 Sorteos actuales:');
      allLotteries.forEach(lottery => {
        console.log(`  📋 ${lottery.name} (${lottery.date}) - Prize: ${lottery.prize_amount || 'NULL'}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

checkPrizeAmount();

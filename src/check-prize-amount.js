const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ojhebvlzhoeaabkbifvy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaGVidmx6aG9lYWJraWJpZnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MDkzMDMsImV4cCI6MjA2MDM4NTMwM30.Mb2EqJqIeBhXW9rT4rA3K8LqYv8a2xJ3J5k7l6m8n9o'
);

async function checkPrizeAmount() {
  console.log('🔍 Verificando campo prize_amount en lottery_dates...\n');
  
  try {
    // Obtener estructura de la tabla
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'lottery_dates' });
    
    if (columnsError) {
      console.log('❌ Error obteniendo columnas:', columnsError.message);
      
      // Alternativa: Consultar un registro y ver qué campos devuelve
      console.log('\n🔄 Probando consulta directa...\n');
      const { data: lotteries, error: lotteriesError } = await supabase
        .from('lottery_dates')
        .select('*')
        .limit(1);
      
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
    } else {
      console.log('📋 Columnas de lottery_dates:', columns);
      const hasPrizeAmount = columns.some(col => col.column_name === 'prize_amount');
      console.log(`\n🏆 ¿Existe prize_amount? ${hasPrizeAmount ? '✅ SÍ' : '❌ NO'}`);
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

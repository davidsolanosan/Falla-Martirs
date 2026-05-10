const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ojhebvlzhoeaabkbifvy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaGVidmx6aG9lYWFia2JpZnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMTkyNzcsImV4cCI6MjA5MDY5NTI3N30.etDN7WIrYUg4Af7DFyQQDlv4Yb0QWub5qhSbgvDQLxo'
);

async function checkLotteryDates() {
  try {
    console.log('=== CHECKING LOTTERY DATES ===');
    
    // Get all lottery dates
    const { data: allDates, error: allError } = await supabase
      .from('lottery_dates')
      .select('*');
    
    if (allError) {
      console.error('Error getting all dates:', allError);
      return;
    }
    
    console.log('Total lottery dates:', allDates?.length || 0);
    
    // Group by type and year
    const grouped = {};
    allDates?.forEach(date => {
      const year = new Date(date.date).getFullYear();
      const type = date.lottery_type;
      
      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][type]) grouped[year][type] = 0;
      grouped[year][type]++;
    });
    
    console.log('Grouped by year and type:', grouped);
    
    // Check 2026 specifically
    const dates2026 = allDates?.filter(d => new Date(d.date).getFullYear() === 2026) || [];
    console.log('\n=== 2026 DATES ===');
    console.log('Total 2026 dates:', dates2026.length);
    
    const grouped2026 = {};
    dates2026.forEach(date => {
      const type = date.lottery_type;
      if (!grouped2026[type]) grouped2026[type] = 0;
      grouped2026[type]++;
    });
    
    console.log('2026 by type:', grouped2026);
    
    // Show some examples
    console.log('\n=== EXAMPLE DATES ===');
    dates2026.slice(0, 5).forEach(date => {
      console.log(`${date.date} - ${date.lottery_type}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkLotteryDates();

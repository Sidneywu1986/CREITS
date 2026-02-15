const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const tables = ['abs_loan_detail', 'abs_tranche_info', 'abs_collateral_pool', 'abs_risk_compliance', 'abs_market_stats', 'abs_triggers_events', 'abs_waterfall_structure', 'abs_product_info'];
  
  for (const table of tables) {
    try {
      await supabase.from(table).delete().neq('product_code', 'EMPTY');
      console.log(`Cleared: ${table}`);
    } catch (e) {
      console.log(`Error clearing ${table}:`, e.message);
    }
    await new Promise(r => setTimeout(r, 100));
  }
  
  console.log('\nAll tables cleared successfully!');
}

main();

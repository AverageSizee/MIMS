const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];
const supabase = createClient(url, key);

async function testJoin() {
  const { data, error } = await supabase.from('deliveries').select('*, creator:profiles!deliveries_created_by_fkey(full_name), updater:profiles!deliveries_updated_by_fkey(full_name)').limit(1);
  if (error) {
     console.log('Error 1:', error);
     const { data: d2, error: e2 } = await supabase.from('deliveries').select('*, creator:profiles!created_by(full_name), updater:profiles!updated_by(full_name)').limit(1);
     if (e2) {
         console.log('Error 2:', e2);
         const { data: d3, error: e3 } = await supabase.from('deliveries').select('*, profiles!created_by(full_name)').limit(1);
         console.log('Error 3:', e3);
     } else {
         console.log('Success 2!', d2[0].creator);
     }
  } else {
     console.log('Success 1!', data[0].creator, data[0].updater);
  }
}
testJoin();

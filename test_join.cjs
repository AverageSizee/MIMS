require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];
const supabase = createClient(url, key);

async function testJoin() {
  const { data, error } = await supabase.from('deliveries').select('*, creator:profiles!created_by(full_name), updater:profiles!updated_by(full_name)').limit(1);
  if (error) {
     console.log('Error 1:', error);
     const { data: d2, error: e2 } = await supabase.from('deliveries').select('*, profiles!created_by(full_name)').limit(1);
     console.log('Error 2:', e2);
  } else {
     console.log('Success!', data[0].creator, data[0].updater);
  }
}
testJoin();

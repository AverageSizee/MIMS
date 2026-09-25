import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, val] = line.split('=');
  if (key && val) env[key.trim()] = val.trim();
});

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);

async function test() {
  const { count: sc } = await supabase.from('suppliers').select('*', { count: 'exact', head: true });
  const { count: dc } = await supabase.from('deliveries').select('*', { count: 'exact', head: true });
  const { count: ic } = await supabase.from('issuances').select('*', { count: 'exact', head: true });
  const { count: rc } = await supabase.from('returns').select('*', { count: 'exact', head: true });
  const { count: mc } = await supabase.from('materials').select('*', { count: 'exact', head: true });
  
  console.log(`Suppliers: ${sc}, Deliveries: ${dc}, Issuances: ${ic}, Returns: ${rc}, Materials: ${mc}`);
}
test();

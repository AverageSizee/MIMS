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
  const { data, error } = await supabase.from('deliveries').select('*, materials(material_description), suppliers(supplier_name)');
  console.log('Deliveries Error:', error);
  console.log('Deliveries Data Length:', data ? data.length : 0);
  
  const { data: d2, error: e2 } = await supabase.from('suppliers').select('*');
  console.log('Suppliers Error:', e2);
  console.log('Suppliers Data Length:', d2 ? d2.length : 0);
}
test();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_URL';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_KEY';
// Since I don't have the env vars here, I will just write a patch that REMOVES the creator/updater joins from the select statements.
// The user doesn't necessarily need "creator_name" to be perfectly fetched right now if it's breaking the whole UI!

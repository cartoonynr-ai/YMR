import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking 'brands' table...");
  const { data: bData, error: bErr } = await supabase.from('brands').select('*').limit(1);
  if (bErr) {
    console.error("Brands Error:", bErr.message);
  } else {
    console.log("Brands table OK:", bData);
  }

  console.log("Checking 'vehicle_models' table...");
  const { data: mData, error: mErr } = await supabase.from('vehicle_models').select('*').limit(1);
  if (mErr) {
    console.error("Vehicle Models Error:", mErr.message);
  } else {
    console.log("Vehicle Models table OK:", mData);
  }
}

check();

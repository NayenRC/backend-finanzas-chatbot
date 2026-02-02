import { createClient } from '@supabase/supabase-js';

let supabase = null;

if (
  process.env.SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  supabase = createClient(
    process.env.SUPABASE_URL.trim(),
    process.env.SUPABASE_SERVICE_ROLE_KEY.trim()
  );
} else {
  console.warn('⚠️ Supabase NO inicializado (variables faltantes)');
}

export default { supabase };

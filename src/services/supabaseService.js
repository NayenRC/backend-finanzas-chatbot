import { createClient } from '@supabase/supabase-js';
import ChatMensaje from '../models/ChatMensaje.js';
import Gasto from '../models/Gasto.js';
import Ingreso from '../models/Ingreso.js';
import Categoria from '../models/Categoria.js';
import Usuario from '../models/Usuario.js';
// Importamos MetaAhorro y MovimientoAhorro por si se usan en el futuro o para consultas completas
// import MetaAhorro from '../models/MetaAhorro.js';
// import MovimientoAhorro from '../models/MovimientoAhorro.js';

// 1. Extraemos las variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

// 2. Verificación de seguridad en logs de Railway
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERROR CRÍTICO: Faltan variables de entorno de Supabase en el servidor.");
}

// 3. Creamos el cliente
const supabase = createClient(supabaseUrl, supabaseKey);

// 4. Exportación única por defecto
export default supabase;
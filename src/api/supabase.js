import { createClient } from '@supabase/supabase-js';

// Aquí traemos las llaves que guardaste en el archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Verificamos que las llaves existan para que no falle el programa
if (!supabaseUrl || !supabaseAnonKey) {
    console.error("ERROR: Faltan las variables de entorno en el archivo .env");
}

// Creamos la conexión oficial
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
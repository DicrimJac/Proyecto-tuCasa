// config/database.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// NOTA: En Deno 2, std/dotenv ya no exporta "config" como antes.
// Como actualmente estás usando valores fijos para Supabase, eliminamos
// la dependencia de dotenv para evitar errores de import.

// TODO (mejora futura): mover estas credenciales a variables de entorno
// y cargarlas con la nueva API de dotenv o Deno.env.
const supabaseUrl = "https://hobokkiejfnbgglbctpk.supabase.co";
const supabaseKey = "sb_publishable_Qn7smKJrhpGseZ0p5XXcKg_qAMiIQuB";

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Faltan variables de entorno: SUPABASE_URL y SUPABASE_KEY");
}

// Cliente singleton
let supabaseInstance = null;

export const getSupabaseClient = () => {
    if (!supabaseInstance) {
        supabaseInstance = createClient(supabaseUrl, supabaseKey);
    }
    return supabaseInstance;
};

// Clase padre Repository (clase normal JS, sin "abstract" para compatibilidad con Deno)
export class BaseRepository {
    constructor() {
        this.supabase = getSupabaseClient();
    }
}
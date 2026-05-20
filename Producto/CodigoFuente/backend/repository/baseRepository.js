// config/database.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://hobokkiejfnbgglbctpk.supabase.co";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
    Deno.env.get("SUPABASE_ANON_KEY") ||
    "sb_publishable_Qn7smKJrhpGseZ0p5XXcKg_qAMiIQuB";

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Faltan variables de entorno: SUPABASE_URL y SUPABASE_KEY");
}

let supabaseInstance = null;

export const getSupabaseClient = () => {
    if (!supabaseInstance) {
        supabaseInstance = createClient(supabaseUrl, supabaseKey);
    }
    return supabaseInstance;
};

export class BaseRepository {
    constructor() {
        this.supabase = getSupabaseClient();
    }
}

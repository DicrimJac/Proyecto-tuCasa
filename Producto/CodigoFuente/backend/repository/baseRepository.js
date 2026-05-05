// config/database.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://hobokkiejfnbgglbctpk.supabase.co";
const supabaseKey = "sb_publishable_Qn7smKJrhpGseZ0p5XXcKg_qAMiIQuB";

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
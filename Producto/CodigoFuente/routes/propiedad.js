import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// variables desde .env
const supabaseUrl = "https://hobokkiejfnbgglbctpk.supabase.co";
const supabaseKey = "sb_publishable_Qn7smKJrhpGseZ0p5XXcKg_qAMiIQuB";

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Faltan variables de entorno");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const { data: created, error: errCreate } = await supabase
  .from("PROPIEDAD")
  .insert([{
    type_nbr: 1,
    type_desc: "Departamento",
    state_nbr: 1,
    state_desc: "Disponible",
    id_address: 1
  }])
  .select();

console.log("CREATE:", created, errCreate);

const { data: all, error: errRead } = await supabase
  .from("PROPIEDAD")
  .select("*");

console.log("READ ALL:", all, errRead);

const { data: one, error: errOne } = await supabase
  .from("PROPIEDAD")
  .select("*")
  .eq("id_propi", 1)
  .single();

console.log("READ ONE:", one, errOne);

const { data: updated, error: errUpdate } = await supabase
  .from("PROPIEDAD")
  .update({
    state_desc: "Vendida"
  })
  .eq("id_propi", 1)
  .select();

console.log("UPDATE:", updated, errUpdate);

const { data: deleted, error: errDelete } = await supabase
  .from("PROPIEDAD")
  .delete()
  .eq("id_propi", 1)
  .select();

console.log("DELETE:", deleted, errDelete);
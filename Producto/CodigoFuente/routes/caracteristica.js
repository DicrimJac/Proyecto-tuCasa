import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// variables desde .env
const supabaseUrl = "https://hobokkiejfnbgglbctpk.supabase.co";
const supabaseKey = "sb_publishable_Qn7smKJrhpGseZ0p5XXcKg_qAMiIQuB";

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Faltan variables de entorno");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const { data: created, error: errCreate } = await supabase
  .from("CARACTERISTICA")
  .insert([{
    total_mtr: 80,
    surface_mtr: 75,
    qty_room: 3,
    qty_bath: 2,
    qty_year: 2015,
    qty_floor: 5,
    orientation_nbr: 1,
    orientation: "Norte",
    h_store: false,
    h_parkin: true,
    h_gas: true,
    h_air: false,
    h_heat: true,
    h_logia: true,
    h_energy_solar: false,
    h_bioler: false,
    h_cale: true,
    h_fire_place: false,
    h_gym: false,
    h_parkin_visit: true,
    h_elevator: true,
    h_place_kid: false,
    h_place_green: true,
    h_salon: false,
    h_alarm: true,
    h_recip: true,
    h_close: false,
    h_control: true,
    h_balcony: true,
    h_suite: true,
    h_yard: false,
    h_walki_clos: true,
    h_pool: true,
    w_furnitor: false,
    h_comedor: true, 
    price: 120000000,
    type_publis_nbr: 1,
    type_publis_desc: "Venta",
    id_propi: 1
  }])
  .select();

console.log("CREATE:", created, errCreate);

const { data: all, error: errRead } = await supabase
  .from("CARACTERISTICA")
  .select("*");

console.log("READ ALL:", all, errRead);

const { data: one, error: errOne } = await supabase
  .from("CARACTERISTICA")
  .select("*")
  .eq("id_carac", 1)
  .single();

console.log("READ ONE:", one, errOne);

const { data: updated, error: errUpdate } = await supabase
  .from("CARACTERISTICA")
  .update({
    price: 130000000,
    h_pool: false
  })
  .eq("id_carac", 1)
  .select();

console.log("UPDATE:", updated, errUpdate);

const { data: deleted, error: errDelete } = await supabase
  .from("CARACTERISTICA")
  .delete()
  .eq("id_carac", 1)
  .select();

console.log("DELETE:", deleted, errDelete);

import { supabase } from "../lib/bbdd.ts";

// Verificación de variables (debug)
console.log("ENV URL:", Deno.env.get("SUPABASE_URL"));

const { data, error } = await supabase
  .from("USUARIO")
  .select("*");

if (error) {
  console.error("❌ Error:", error.message);
} else {
  console.log("✅ Conexión completa OK");
  console.log(data);
}
import { supabase } from "../lib/bbdd.ts";

// CREATE
export async function crearUsuario(nombre: string) {
  const { data, error } = await supabase
    .from("USUARIO")
    .insert([{ nombre }])
    .select();

  return { data, error };
}

// READ ALL
export async function obtenerUsuarios() {
  const { data, error } = await supabase
    .from("USUARIO")
    .select("*");

  return { data, error };
}

// READ BY ID
export async function obtenerUsuario(id: number) {
  const { data, error } = await supabase
    .from("USUARIO")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
}

// UPDATE
export async function actualizarUsuario(id: number, nombre: string) {
  const { data, error } = await supabase
    .from("USUARIO")
    .update({ nombre })
    .eq("id", id)
    .select();

  return { data, error };
}

// DELETE
export async function eliminarUsuario(id: number) {
  const { error } = await supabase
    .from("USUARIO")
    .delete()
    .eq("id", id);

  return { error };
}
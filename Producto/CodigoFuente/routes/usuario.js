import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// variables desde .env
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Faltan variables de entorno");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 🔹 CREATE
const { data: created, error: errCreate } = await supabase
  .from("USUARIO")
  .insert([{
    first_name: "Jaqui",
    second_name: "JS",
    first_last_name: "Perez",
    second_last_name: "Gomez",
    rut: "12345678",
    rut_dv: "9",
    fono: "+56912345678",
    mail: "jaqui@mail.com",
    nacionalidad: "Chilena",
    rol_nbr: 1,
    rol_desc: "ADMIN",
    date_birth: "1995-06-15",
    gender_nbr: 1,
    gender_desc: "Femenino",
    password: "123456"
    // date_register NO se envía si tienes DEFAULT
  }])
  .select();

console.log("CREATE:", created, errCreate);


// 🔹 READ ALL
const { data: all, error: errRead } = await supabase
  .from("USUARIO")
  .select("*");

console.log("READ ALL:", all, errRead);


// 🔹 tomar un id (CORREGIDO)
const id = all?.[0]?.id_usuario;

if (id) {

  // 🔹 READ ONE
  const { data: one, error: errOne } = await supabase
    .from("USUARIO")
    .select("*")
    .eq("id_usuario", id)
    .single();

  console.log("READ ONE:", one, errOne);


  // 🔹 UPDATE (CORREGIDO: usar campos reales)
  const { data: updated, error: errUpdate } = await supabase
    .from("USUARIO")
    .update({
      first_name: "Jaqui Actualizada",
      mail: "nuevo@mail.com"
    })
    .eq("id_usuario", id)
    .select();

  console.log("UPDATE:", updated, errUpdate);


  // 🔹 DELETE
  const { error: errDelete } = await supabase
    .from("USUARIO")
    .delete()
    .eq("id_usuario", id);

  console.log("DELETE:", errDelete);
}

// TS

// import {
//   crearUsuario,
//   obtenerUsuarios,
//   obtenerUsuario,
//   actualizarUsuario,
//   eliminarUsuario,
// } from "./services/usuario.ts";

// // 🔹 CREATE
// const nuevo = await crearUsuario("Jaqui");
// console.log("CREATE:", nuevo);

// // 🔹 READ ALL
// const lista = await obtenerUsuarios();
// console.log("READ ALL:", lista);

// // 🔹 READ BY ID (usa el id que se creó)
// const id = lista.data?.[0]?.id;

// if (id) {
//   const uno = await obtenerUsuario(id);
//   console.log("READ ONE:", uno);

//   // 🔹 UPDATE
//   const update = await actualizarUsuario(id, "Jaqui Updated");
//   console.log("UPDATE:", update);

//   // 🔹 DELETE
//   const del = await eliminarUsuario(id);
//   console.log("DELETE:", del);
// }
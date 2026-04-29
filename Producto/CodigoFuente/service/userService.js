
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// variables desde .env
const supabaseUrl = "https://hobokkiejfnbgglbctpk.supabase.co";
const supabaseKey = "sb_publishable_Qn7smKJrhpGseZ0p5XXcKg_qAMiIQuB";

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Faltan variables de entorno");
}
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Crear un nuevo usuario (con validación de email duplicado)
 */
export async function createUser(userData) {
    try {
        const { mail, first_name, pass, ...rest } = userData;

        // Validar si el email ya existe
        const { data: existe } = await supabase
            .from("USUARIO")
            .select("mail")
            .eq("mail", mail)
            .maybeSingle();

        if (existe) {
            console.log(`El correo "${mail}" ya está registrado`);
            return;
        }

        // Crear usuario
        const { data, error } = await supabase
            .from("USUARIO")
            .insert([{
                ...rest,
                mail,
                first_name,
                pass,
                date_register: new Date().toISOString().split("T")[0],
            }])
            .select();

        if (error) throw error;

        console.log(`Usuario creado: ${data[0].first_name} (${data[0].mail})`);
        return data[0];

    } catch (error) {
        console.log("Error al crear usuario:", error.message);
    }
}

    /**
     * Obtener todos los usuarios
     */
    export async function getUser() {
    try {
        const { data, error } = await supabase
        .from("USUARIO")
        .select("*")
        .order("id_usuario", { ascending: true });

        if (error) {
        console.log("Error al obtener usuarios:", error.message);
        return;
        }

        if (data.length === 0) {
        console.log("No hay usuarios registrados");
        return;
        }

        console.log(`Total de usuarios: ${data.length}`);
        data.forEach((user) => {
        console.log(`   - ${user.first_name} ${user.first_last_name || ""} | ${user.mail} | Rol: ${user.rol_desc}`);
        });
    } catch (error) {
        console.log("Error en obtenerUsuarios:", error.message);
    }
    }
/** 
    /**
     * Obtener un usuario por ID
     */
    export async function getUserById(id) {
    try {
        const { data, error } = await supabase
        .from("USUARIO")
        .select("*")
        .eq("id_usuario", id)
        .single();

        if (error) {
        console.log("Usuario no encontrado con ID:", id);
        return;
        }

        console.log(`   Usuario encontrado:`);
        console.log(`   ID: ${data.id_usuario}`);
        console.log(`   Nombre: ${data.first_name} ${data.first_last_name || ""}`);
        console.log(`   Email: ${data.mail}`);
        console.log(`   Rol: ${data.rol_desc}`);
        console.log(`   Teléfono: ${data.fono || "No registrado"}`);
    } catch (error) {
        console.log("Error en obtenerUsuarioPorId:", error.message);
    }
    }

    /**
     * Obtener un usuario por email
     */
    export async function getUserByEmail(email) {
    try {
        const { data, error } = await supabase
        .from("USUARIO")
        .select("*")
        .eq("mail", email)
        .single();

        if (error) {
        console.log("Usuario no encontrado con email:", email);
        return;
        }

        console.log(`   Usuario encontrado:`);
        console.log(`   ID: ${data.id_usuario}`);
        console.log(`   Nombre: ${data.first_name} ${data.first_last_name || ""}`);
        console.log(`   Email: ${data.mail}`);
        console.log(`   Rol: ${data.rol_desc}`);
    } catch (error) {
        console.log("   Error en obtenerUsuarioPorEmail:", error.message);
    }
    }

    /**
     * Actualizar un usuario existente
     */
    export async function updateUser(id, updates) {
    try {
        // Limpiar campos undefined
        const cleanUpdates = {};
        const allowedFields = [
        "first_name",
        "second_name",
        "first_last_name",
        "second_last_name",
        "rut",
        "rut_dv",
        "fono",
        "mail",
        "nacionalidad",
        "rol_nbr",
        "rol_desc",
        "date_birth",
        "gender_nbr",
        "gender_desc",
        "pass",
        ];

        for (const field of allowedFields) {
        if (updates[field] !== undefined) {
            cleanUpdates[field] = updates[field];
        }
        }

        if (Object.keys(cleanUpdates).length === 0) {
        console.log("No hay campos para actualizar");
        return;
        }

        const { data, error } = await supabase
        .from("USUARIO")
        .update(cleanUpdates)
        .eq("id_usuario", id)
        .select();

        if (error) {
        console.log("Error al actualizar usuario:", error.message);
        return;
        }

        if (!data || data.length === 0) {
        console.log("Usuario no encontrado con ID:", id);
        return;
        }

        console.log(`   Usuario actualizado exitosamente:`);
        console.log(`   ID: ${data[0].id_usuario}`);
        console.log(`   Nuevo nombre: ${data[0].first_name} ${data[0].first_last_name || ""}`);
    } catch (error) {
        console.log("Error en actualizarUsuario:", error.message);
    }
    }

    /**
     * Eliminar un usuario por ID
     */
    export async function deleteUser(id) {
    try {
        // Primero verificar si existe
        const { data: existe, error: errorExiste } = await cliente
        .from("USUARIO")
        .select("first_name, mail")
        .eq("id_usuario", id)
        .single();

        if (errorExiste) {
        console.log("Usuario no encontrado con ID:", id);
        return;
        }

        const { error } = await supabase
        .from("USUARIO")
        .delete()
        .eq("id_usuario", id);

        if (error) {
        console.log("Error al eliminar usuario:", error.message);
        return;
        }

        console.log(`Usuario eliminado: ${existe.first_name} (${existe.mail})`);
    } catch (error) {
        console.log("Error en eliminarUsuario:", error.message);
    }
    }

    /**
 * Eliminar un usuario por Email (versión simple)
 */
export async function deleteUserByEmail(email) {
    try {
        // Verificar si existe
        const { data: existe, error: errorExiste } = await supabase
            .from("USUARIO")
            .select("first_name, mail")
            .eq("mail", email)
            .maybeSingle();

        if (!existe) {
            console.log(`Usuario no encontrado con email: ${email}`);
            return;
        }

        // Eliminar
        const { error } = await supabase
            .from("USUARIO")
            .delete()
            .eq("mail", email);

        if (error) throw error;

        console.log(`Usuario eliminado: ${existe.first_name} (${existe.mail})`);

    } catch (error) {
        console.log("Error al eliminar usuario:", error.message);
    }
}

    /**
     * Autenticar usuario (login)
     */
    export async function loginUser(email, password) {
    try {
        const { data, error } = await supabase
        .from("USUARIO")
        .select("*")
        .eq("mail", email)
        .single();

        if (error) {
        console.log("Usuario no encontrado:", email);
        return;
        }

        if (data.pass !== password) {
        console.log("Contraseña incorrecta para el usuario:", email);
        return;
        }

        console.log(`   Inicio de sesión exitoso:`);
        console.log(`   Bienvenido: ${data.first_name} ${data.first_last_name || ""}`);
        console.log(`   Rol: ${data.rol_desc}`);
        console.log(`   Email: ${data.mail}`);
    } catch (error) {
        console.log("Error en loginUsuario:", error.message);
    }


    }
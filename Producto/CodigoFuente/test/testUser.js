// testUserInteractiveV2.js
import {
    createUser,
    getUser,
    getUserByEmail,
    deleteUser,
    deleteUserByEmail,
    updateUser,
} from "../service/userService.js";

// Configurar lectura de consola

async function pregunta(texto) {
    console.log(texto);
    const buffer = new Uint8Array(1024);
    const n = await Deno.stdin.read(buffer);
    return new TextDecoder().decode(buffer.subarray(0, n)).trim();
}

async function test() {
    console.log("\n=== SISTEMA CRUD DE USUARIOS ===\n");
    
    let opcion = 0;
    
    while (opcion !== 7) {
        console.log("\nMENÚ PRINCIPAL:");
        console.log("1. Crear usuario");
        console.log("2. Listar usuarios");
        console.log("3. Buscar usuario por email");
        console.log("4. Eliminar usuario por ID");
        console.log("5. Eliminar usuario por email");
        console.log("6. Actualizar usuario");
        console.log("7. Salir");
        
        const input = await pregunta("Seleccione una opción (1-7): ");
        opcion = parseInt(input);
        
        switch (opcion) {
            case 1:
                await crearUsuarioInteractivo();
                break;
            case 2:
                await getUser();
                break;
            case 3:
                await buscarUsuarioPorEmail();
                break;
            case 4:
                await eliminarUsuarioPorId();
                break;
            case 5:
                await eliminarUsuarioPorEmail();
                break;
            case 6:
                await actualizarUsuarioInteractivo();
                break;
            case 7:
                console.log("\n¡Hasta luego!");
                break;
            default:
                console.log("\nOpción inválida. Intente nuevamente.");
        }
    }
}

async function crearUsuarioInteractivo() {
    console.log("\n--- CREAR NUEVO USUARIO ---");
    
    const userData = {
        first_name: await pregunta("Nombre: "),
        second_name: await pregunta("Segundo nombre (opcional): "),
        first_last_name: await pregunta("Apellido paterno: "),
        second_last_name: await pregunta("Apellido materno (opcional): "),
        rut: await pregunta("RUT (sin puntos): "),
        rut_dv: await pregunta("Dígito verificador: "),
        fono: await pregunta("Teléfono: "),
        mail: await pregunta("Email: "),
        nacionalidad: await pregunta("Nacionalidad: "),
        rol_nbr: parseInt(await pregunta("Rol (1: Admin, 2: Arrendador, 3: Arrendatario): ")),
        date_birth: await pregunta("Fecha de nacimiento (YYYY-MM-DD): "),
        gender_nbr: parseInt(await pregunta("Género (1: Masculino, 2: Femenino, 3: Otro): ")),
        pass: await pregunta("Contraseña: ")
    };
    
    // Asignar descripciones
    const roles = { 1: "ADMIN", 2: "ARRENDADOR", 3: "ARRENDATARIO" };
    const generos = { 1: "Masculino", 2: "Femenino", 3: "Otro" };
    
    userData.rol_desc = roles[userData.rol_nbr] || "ARRENDATARIO";
    userData.gender_desc = generos[userData.gender_nbr] || "Otro";
    
    console.log("\n Confirmar datos:");
    console.log(`   Nombre: ${userData.first_name} ${userData.second_name} ${userData.first_last_name} ${userData.second_last_name}`);
    console.log(`   Rut: ${userData.rut} ${userData.rut_dv}`);
    console.log(`   Telefono: ${userData.fono}`);
    console.log(`   Email: ${userData.mail}`);
    console.log(`   Nacionalidad: ${userData.nacionalidad}`)
    console.log(`   Rol: ${userData.rol_desc}`);
    console.log(`   Fecha de nacimiento: ${userData.date_birth}`);
    console.log(`   Genero: ${userData.gender_nbr}`)
    
    const confirmar = await pregunta("¿Desea guardar este usuario? (s/n): ");
    
    if (confirmar.toLowerCase() === 's') {
        await createUser(userData);
    } else {
        console.log("Creación cancelada");
    }
}

async function actualizarUsuarioInteractivo() {
    console.log("\n--- ACTUALIZAR USUARIO ---");

    const idInput = await pregunta("Ingrese el ID del usuario a actualizar: ");
    const id = parseInt(idInput);
    if (Number.isNaN(id)) {
        console.log("ID inválido. Regresando al menú.");
        return;
    }

    const updates = {};

    const first_name = await pregunta("Nuevo nombre (dejar en blanco para no actualizar): ");
    if (first_name.trim()) updates.first_name = first_name;

    const second_name = await pregunta("Nuevo segundo nombre (opcional): ");
    if (second_name.trim()) updates.second_name = second_name;

    const first_last_name = await pregunta("Nuevo apellido paterno (dejar en blanco): ");
    if (first_last_name.trim()) updates.first_last_name = first_last_name;

    const second_last_name = await pregunta("Nuevo apellido materno (opcional): ");
    if (second_last_name.trim()) updates.second_last_name = second_last_name;

    const rut = await pregunta("Nuevo RUT (sin puntos) (opcional): ");
    if (rut.trim()) updates.rut = rut;

    const rut_dv = await pregunta("Nuevo Dígito verificador (opcional): ");
    if (rut_dv.trim()) updates.rut_dv = rut_dv;

    const fono = await pregunta("Nuevo Teléfono (opcional): ");
    if (fono.trim()) updates.fono = fono;

    const mail = await pregunta("Nuevo Email (opcional): ");
    if (mail.trim()) updates.mail = mail;

    const nacionalidad = await pregunta("Nueva Nacionalidad (opcional): ");
    if (nacionalidad.trim()) updates.nacionalidad = nacionalidad;

    const date_birth = await pregunta("Nueva Fecha de nacimiento (YYYY-MM-DD) (opcional): ");
    if (date_birth.trim()) updates.date_birth = date_birth;

    const pass = await pregunta("Nueva Contraseña (opcional): ");
    if (pass.trim()) updates.pass = pass;

    const rol_nbrInput = await pregunta("Nuevo Rol (1: Admin, 2: Arrendador, 3: Arrendatario) (opcional): ");
    if (rol_nbrInput.trim()) {
        const rol_nbr = parseInt(rol_nbrInput);
        if (!Number.isNaN(rol_nbr)) {
            updates.rol_nbr = rol_nbr;
            const roles = { 1: "ADMIN", 2: "ARRENDADOR", 3: "ARRENDATARIO" };
            updates.rol_desc = roles[rol_nbr] || "ARRENDATARIO";
        }
    }

    const gender_nbrInput = await pregunta("Nuevo Genero (1: Masculino, 2: Femenino, 3: Otro) (opcional): ");
    if (gender_nbrInput.trim()) {
        const gender_nbr = parseInt(gender_nbrInput);
        if (!Number.isNaN(gender_nbr)) {
            updates.gender_nbr = gender_nbr;
            const generos = { 1: "Masculino", 2: "Femenino", 3: "Otro" };
            updates.gender_desc = generos[gender_nbr] || "Otro";
        }
    }

    if (Object.keys(updates).length === 0) {
        console.log("No se proporcionaron campos para actualizar");
        return;
    }

    await updateUser(id, updates);
}

async function buscarUsuarioPorEmail() {
    console.log("\n--- BUSCAR USUARIO POR EMAIL ---");
    const email = await pregunta("Ingrese el email del usuario: ");
    await getUserByEmail(email);
}

async function eliminarUsuarioPorId() {
    console.log("\n--- ELIMINAR USUARIO POR ID ---");
    const id = parseInt(await pregunta("Ingrese el ID del usuario: "));
    const confirmar = await pregunta(`¿Está seguro de eliminar el usuario con ID ${id}? (s/n): `);
    if (confirmar.toLowerCase() === 's') {
        await deleteUser(id);
    } else {
        console.log("Eliminación cancelada");
    }
}

async function eliminarUsuarioPorEmail() {
    console.log("\n--- ELIMINAR USUARIO POR EMAIL ---");
    const email = await pregunta("Ingrese el email del usuario: ");
    const confirmar = await pregunta(`¿Está seguro de eliminar el usuario con email ${email}? (s/n): `);
    if (confirmar.toLowerCase() === 's') {
        await deleteUserByEmail(email);
    } else {
        console.log("Eliminación cancelada");
    }
}

test();
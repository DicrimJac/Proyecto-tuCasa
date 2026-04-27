
// testUser.js
    import {
    createUser,
    getUser,
    /*
    getUserById,
    getUserByEmail,
    updateUser,
    deleteUser,
    loginUser,
    */
    } from "../service/userService.js"

    async function test() {
    console.log("\n=== TEST CRUD USUARIO ===\n");

    // Crear usuario
    console.log("--- 1. Crear usuario ---");
    await createUser({
        first_name: "Juan",
        second_name: "Carlos",
        first_last_name: "Perez",
        second_last_name: "Gonzalez",
        rut: "12345678",
        rut_dv: "9",
        fono: "+56912345678",
        mail: "juan.perez@example.com",
        nacionalidad: "Chilena",
        rol_nbr: 2,
        rol_desc: "ARRENDATARIO",
        date_birth: "1990-05-15",
        gender_nbr: 1,
        gender_desc: "Masculino",
        pass: "miPassword123",
    });

    //Intenta crear usuario con el mismo email
    console.log("\n--- 2. Intentar crear mismo email (duplicado) ---");
    await createUser({
        first_name: "Pedro",
        mail: "juan.perez@example.com",
        pass: "otraPass",
    });

    //muestra usuarios
    console.log("\n--- 3. Listar todos los usuarios ---");
    await getUser();


    
    /*
    Busca usuario por ID
    console.log("\n--- 4. Buscar usuario por ID (asumiendo ID 1) ---");
    await getUserByEmail(1);

    Busca usuario por email
    console.log("\n--- 5. Buscar usuario por email ---");
    await getUserByEmail("juan.perez@example.com");

    Login con contraseña correcta
    console.log("\n--- 6. Intentar login con contraseña correcta ---");
    await loginUser("juan.perez@example.com", "miPassword123");

    login con contraseña incorrecta
    console.log("\n--- 7. Intentar login con contraseña incorrecta ---");
    await loginUser("juan.perez@example.com", "passIncorrecta");

    Actualizar usuario
    console.log("\n--- 8. Actualizar usuario ---");
    await updateUser(1, {
        first_name: "Juan Actualizado",
        fono: "+56999999999",
    });

    verifica actualizacion
    console.log("\n--- 9. Verificar actualización ---");
    await getUserById(1);

    Elimina usuario
    console.log("\n--- 10. Eliminar usuario (descomentar para ejecutar) ---");
    await deleteUser(1);
*/
    console.log("\n=== FIN DEL TEST ===\n");
    }

    // Ejecutar test
    test();
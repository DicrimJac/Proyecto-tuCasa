import {
    assertEquals,
    assertStringIncludes,
} from "@std/assert";

import { UserService } from "../../backend/service/userService.js";

Deno.test("debe obtener todos los usuarios sin exponer password", async () => {

    const service = new UserService();

    service.userRepository.findAll = async () => [
        {
            id_usuario: 1,
            first_name: "Juan",
            pass: "123456"
        }
    ];

    const result = await service.getAllUsers();

    assertEquals(result.success, true);
    assertEquals(result.total, 1);
    assertEquals(result.data[0].pass, undefined);

});

Deno.test("debe rechazar registro con campos faltantes", async () => {

    const service = new UserService();

    const result = await service.register({});

    assertEquals(result.success, false);
    assertStringIncludes(
        result.error,
        "Faltan campos requeridos"
    );

});

Deno.test("debe registrar usuario correctamente", async () => {

    const service = new UserService();

    service.userRepository.create = async () => ({
        id_usuario: 1,
        first_name: "Juan",
        mail: "juan@test.cl",
        pass: "123456"
    });

    const result = await service.register({
        firstName: "Juan",
        email: "juan@test.cl",
        password: "123456"
    });

    assertEquals(result.success, true);
    assertEquals(result.data.pass, undefined);

});

Deno.test("debe rechazar fecha invalida", async () => {

    const service = new UserService();

    let error;

    try {
        await service.register({
            firstName: "Juan",
            email: "juan@test.cl",
            password: "123456",
            birthDate: "10/10/2000"
        });
    } catch (e) {
        error = e;
    }

    assertEquals(error.message, "Fecha de nacimiento inválida");

});

Deno.test("debe autenticar usuario correctamente", async () => {

    const service = new UserService();

    service.userRepository.findByEmail = async () => ({
        id_usuario: 1,
        mail: "juan@test.cl",
        pass: "123456"
    });

    const result = await service.authenticateByEmail(
        "juan@test.cl",
        "123456"
    );

    assertEquals(result.success, true);
    assertEquals(result.data.pass, undefined);

});

Deno.test("debe rechazar password incorrecta", async () => {

    const service = new UserService();

    service.userRepository.findByEmail = async () => ({
        mail: "juan@test.cl",
        pass: "123456"
    });

    const result = await service.authenticateByEmail(
        "juan@test.cl",
        "654321"
    );

    assertEquals(result.success, false);
    assertEquals(
        result.error,
        "Credenciales no válidas"
    );

});

Deno.test("debe obtener usuario por id", async () => {

    const service = new UserService();

    service.userRepository.findById = async () => ({
        id_usuario: 1,
        pass: "123456"
    });

    const result = await service.getUserById("1");

    assertEquals(result.success, true);
    assertEquals(result.data.pass, undefined);

});

Deno.test("debe lanzar error cuando id no existe", async () => {

    const service = new UserService();

    let error;

    try {
        await service.getUserById();
    } catch (e) {
        error = e;
    }

    assertEquals(error.message, "El ID es requerido");

});

Deno.test("debe obtener usuario por email", async () => {

    const service = new UserService();

    service.userRepository.findByEmail = async () => ({
        id_usuario: 1,
        mail: "juan@test.cl",
        pass: "123456"
    });

    const result = await service.getUserByEmail(
        "JUAN@TEST.CL"
    );

    assertEquals(result.success, true);
    assertEquals(result.data.pass, undefined);

});

Deno.test("debe validar correo existente", async () => {

    const service = new UserService();

    service.userRepository.findByEmail = async () => ({
        mail: "juan@test.cl"
    });

    const result = await service.validateUserEmail(
        "juan@test.cl"
    );

    assertEquals(result.success, true);

});

Deno.test("debe cambiar contraseña correctamente", async () => {

    const service = new UserService();

    service.userRepository.findByEmail = async () => ({
        id_usuario: 1,
        mail: "juan@test.cl",
        pass: "123456"
    });

    service.userRepository.updateByUserRecord = async () => ({
        id_usuario: 1,
        mail: "juan@test.cl",
        pass: "654321"
    });

    const result = await service.changePasswordByMail(
        "juan@test.cl",
        {
            currentPassword: "123456",
            newPassword: "654321"
        }
    );

    assertEquals(result.success, true);

});

Deno.test("debe rechazar contraseña actual incorrecta", async () => {

    const service = new UserService();

    service.userRepository.findByEmail = async () => ({
        pass: "123456"
    });

    const result = await service.changePasswordByMail(
        "juan@test.cl",
        {
            currentPassword: "000000",
            newPassword: "654321"
        }
    );

    assertEquals(result.success, false);

    assertStringIncludes(
        result.error,
        "actual no es correcta"
    );

});

Deno.test("debe resetear contraseña", async () => {

    const service = new UserService();

    service.userRepository.findByEmail = async () => ({
        id_usuario: 1
    });

    service.userRepository.updateByUserRecord = async () => ({
        id_usuario: 1,
        pass: "654321"
    });

    const result = await service.resetPasswordByMail(
        "juan@test.cl",
        "654321"
    );

    assertEquals(result.success, true);

});

Deno.test("debe eliminar usuario por mail", async () => {

    const service = new UserService();

    service.userRepository.findByEmail = async () => ({
        id_usuario: 1,
        mail: "juan@test.cl"
    });

    service.propertyService.repository.findByOwnerId =
        async () => [];

    service.userRepository.deleteByUserRecord =
        async () => ({
            deleted: true
        });

    const result = await service.deleteUserByMail(
        "juan@test.cl"
    );

    assertEquals(result.success, true);

});
import { assertEquals } from "jsr:@std/assert@1";

import { UserController } from "../../backend/controller/userController.js";

Deno.test("debe obtener todos los usuarios", async () => {

    const controller = new UserController();

    controller.userService.getAllUsers = async () => ({
        success: true,
        data: [{ id: 1 }],
        total: 1
    });

    let response;
    let status;

    const c = {
        json: (data, code) => {
            response = data;
            status = code;
        }
    };

    await controller.getAllUsers(c);

    assertEquals(status, 200);
    assertEquals(response.success, true);
    assertEquals(response.total, 1);

});

Deno.test("debe iniciar sesion correctamente", async () => {

    const controller = new UserController();

    let emailRecibido;
    let passwordRecibido;

    controller.userService.authenticateByEmail = async (email, password) => {
        emailRecibido = email;
        passwordRecibido = password;

        return {
            success: true,
            data: {
                id_usuario: 1
            }
        };
    };

    const c = {
        req: {
            json: async () => ({
                email: "test@test.cl",
                password: "123456"
            })
        },
        json: () => {}
    };

    await controller.login(c);

    assertEquals(emailRecibido, "test@test.cl");
    assertEquals(passwordRecibido, "123456");

});

Deno.test("debe rechazar login invalido", async () => {

    const controller = new UserController();

    let response;

    controller.userService.authenticateByEmail = async () => ({
        success: false,
        error: "Credenciales no válidas"
    });

    const c = {
        req: {
            json: async () => ({
                email: "test@test.cl",
                password: "123"
            })
        },
        json: (data) => {
            response = data;
        }
    };

    await controller.login(c);

    assertEquals(response.success, false);

});

Deno.test("debe obtener usuario por id", async () => {

    const controller = new UserController();

    let idRecibido;

    controller.userService.getUserById = async (id) => {
        idRecibido = id;

        return {
            success: true,
            data: {
                id_usuario: 1
            }
        };
    };

    const c = {
        req: {
            param: () => "1"
        },
        json: () => {}
    };

    await controller.getUserById(c);

    assertEquals(idRecibido, "1");

});

Deno.test("debe obtener usuario por email", async () => {

    const controller = new UserController();

    let emailRecibido;

    controller.userService.getUserByEmail = async (email) => {
        emailRecibido = email;

        return {
            success: true,
            data: {
                mail: "test@test.cl"
            }
        };
    };

    const c = {
        req: {
            param: () => "test@test.cl"
        },
        json: () => {}
    };

    await controller.getUserByEmail(c);

    assertEquals(emailRecibido, "test@test.cl");

});

Deno.test("debe registrar usuario", async () => {

    const controller = new UserController();

    let fueLlamado = false;

    controller.userService.register = async () => {
        fueLlamado = true;

        return {
            success: true,
            data: {
                id_usuario: 1
            }
        };
    };

    const c = {
        req: {
            json: async () => ({
                firstName: "Juan",
                email: "juan@test.cl",
                password: "123456"
            })
        },
        json: () => {}
    };

    await controller.register(c);

    assertEquals(fueLlamado, true);

});

Deno.test("debe actualizar usuario por mail", async () => {

    const controller = new UserController();

    let fueLlamado = false;

    controller.userService.updateUserByMail = async () => {
        fueLlamado = true;

        return {
            success: true
        };
    };

    const c = {
        req: {
            param: () => "juan@test.cl",
            json: async () => ({
                first_name: "Juan"
            })
        },
        json: () => {}
    };

    await controller.updateUserByMail(c);

    assertEquals(fueLlamado, true);

});

Deno.test("debe cambiar contraseña", async () => {

    const controller = new UserController();

    let fueLlamado = false;

    controller.userService.changePasswordByMail = async () => {
        fueLlamado = true;

        return {
            success: true
        };
    };

    const c = {
        req: {
            param: () => "juan@test.cl",
            json: async () => ({
                currentPassword: "123456",
                newPassword: "654321"
            })
        },
        json: () => {}
    };

    await controller.changePasswordByMail(c);

    assertEquals(fueLlamado, true);

});

Deno.test("debe eliminar usuario por id", async () => {

    const controller = new UserController();

    let idRecibido;

    controller.userService.deleteUser = async (id) => {
        idRecibido = id;

        return {
            success: true
        };
    };

    const c = {
        req: {
            param: () => "1"
        },
        json: () => {}
    };

    await controller.deleteUserById(c);

    assertEquals(idRecibido, "1");

});

Deno.test("debe eliminar usuario por mail", async () => {

    const controller = new UserController();

    let emailRecibido;

    controller.userService.deleteUserByMail = async (email) => {
        emailRecibido = email;

        return {
            success: true
        };
    };

    const c = {
        req: {
            param: () => "juan@test.cl"
        },
        json: () => {}
    };

    await controller.deleteUserByMail(c);

    assertEquals(emailRecibido, "juan@test.cl");

});

Deno.test("debe solicitar recuperacion de contraseña", async () => {

    const controller = new UserController();

    let validacionEjecutada = false;

    controller.userService.validateUserEmail = async () => {
        validacionEjecutada = true;

        return {
            success: true
        };
    };

    controller.emailService.sendPasswordResetCode = async () => ({
        success: true
    });

    const c = {
        req: {
            url: "http://localhost",
            json: async () => ({
                email: "test@test.cl"
            })
        },
        json: () => {}
    };

    await controller.requestPasswordReset(c);

    assertEquals(validacionEjecutada, true);

});

Deno.test("debe rechazar recuperacion sin email", async () => {

    const controller = new UserController();

    let response;
    let status;

    const c = {
        req: {
            json: async () => ({})
        },
        json: (data, code) => {
            response = data;
            status = code;
        }
    };

    await controller.requestPasswordReset(c);

    assertEquals(status, 400);

    assertEquals(response, {
        success: false,
        error: "Email requerido"
    });

});
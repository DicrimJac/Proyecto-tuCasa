import { UserRepository } from "../repository/userRepository.js";

export class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    async getAllUsers() {
        try {
            const users = await this.userRepository.findAll();

            // Aquí puedes agregar lógica de negocio
            // Por ejemplo: filtrar, transformar datos, validaciones, etc.

            return {
                success: true,
                data: users,
                total: users.length,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Obtener usuario por ID
    async getUserById(id) {
        // Validaciones de negocio
        if (!id) {
            throw new Error("El ID es requerido");
        }

        if (typeof id !== "string") {
            throw new Error("El ID debe ser un string");
        }

        try {
            const user = await this.userRepository.findById(id);

            // Lógica de negocio: ocultar campos sensibles
            if (user && user.password) {
                delete user.password;
            }

            return {
                success: true,
                data: user,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
}

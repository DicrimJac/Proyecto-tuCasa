import { UserRepository } from "../repository/userRepository.js";

export class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    async getAllUsers() {
        try {
            const users = await this.userRepository.findAll();

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

    // Registrar nuevo usuario
    async register(userData) {
        if (!userData || !(userData.firstName || userData.first_name) || !(userData.email || userData.mail) || !(userData.password || userData.pass)) {
            return { success: false, error: "Faltan campos requeridos: firstName/first_name, email/mail y password/pass" };
        }
        const birthInput = (userData.birthDate ?? userData.date_birth ?? "");
        let dateBirthNormalized = birthInput;
        if (typeof birthInput === "string") {
            dateBirthNormalized = birthInput.trim();
        }
        if (dateBirthNormalized === "") {
            dateBirthNormalized = null;
        } else if (dateBirthNormalized instanceof Date) {
            const yyyy = dateBirthNormalized.getFullYear();
            const mm = String(dateBirthNormalized.getMonth() + 1).padStart(2, "0");
            const dd = String(dateBirthNormalized.getDate()).padStart(2, "0");
            dateBirthNormalized = `${yyyy}-${mm}-${dd}`;
        } 
        if (typeof dateBirthNormalized === "string" && dateBirthNormalized) {
            const isIso = /^\d{4}-\d{2}-\d{2}$/.test(dateBirthNormalized);
            if (isIso) {
                const parsed = new Date(dateBirthNormalized);
                if (isNaN(parsed.getTime())) {
                    throw new Error("Fecha de nacimiento inválida");
                }
                const yyyy = parsed.getFullYear();
                const mm = String(parsed.getMonth() + 1).padStart(2, "0");
                const dd = String(parsed.getDate()).padStart(2, "0");
                dateBirthNormalized = `${yyyy}-${mm}-${dd}`;
            } else {
                // Si no es ISO y no es null, considerarlo inválido para este flujo
                throw new Error("Fecha de nacimiento inválida");
            }
        }
        const payload = {
            first_name: userData.firstName ?? userData.first_name ?? "",
            second_name: userData.secondName ?? userData.second_name ?? "",
            first_last_name: userData.firstLastName ?? userData.first_last_name ?? "",
            second_last_name: userData.secondLastName ?? userData.second_last_name ?? "",

            rut: (typeof userData.rut === "string" && userData.rut.includes("-")) ? (userData.rut.split("-")[0] ? Number(userData.rut.split("-")[0]) : null) : ((userData.rut !== undefined && userData.rut !== null && userData.rut !== "") ? Number(userData.rut) : null),
            rut_dv: (typeof userData.rut === "string" && userData.rut.includes("-")) ? (userData.rut.split("-")[1] !== undefined && userData.rut.split("-")[1] !== "" ? Number(userData.rut.split("-")[1]) : null) : ((userData.rutDv !== undefined && userData.rutDv !== null && userData.rutDv !== "") ? Number(userData.rutDv) : null),
            fono: (function() {
                // Soporte tanto 'phone' como 'fono' según fuente del payload
                const rawPhone = userData.phone ?? userData.fono ?? "";
                const digits = (rawPhone).replace(/\D/g, "");
                // Si no hay dígitos, devolver null para evitar insert de valor vacio en NUMERIC
                return digits ? Number(digits) : null;
            })(),
            mail: userData.email ?? userData.mail ?? "",
            nacionalidad: userData.nacionalidad ?? userData.nationality ?? "",
            rol_nbr: (userData.rol_nbr !== undefined && userData.rol_nbr !== null && userData.rol_nbr !== "") ? Number(userData.rol_nbr) : 1,
            rol_desc: userData.rol_desc ?? "Usuario",
            date_birth: dateBirthNormalized,
            gender_nbr: (userData.gender !== undefined && userData.gender !== null && userData.gender !== "" ) ? Number(userData.gender) : null,
            gender_desc: (typeof userData.gender_desc === "string" && userData.gender_desc.trim() !== "") ? userData.gender_desc : null,
            pass: userData.password ?? userData.pass ?? ""
        };

        if (payload.gender_nbr != null && (payload.gender_desc == null || payload.gender_desc === "")) {
            switch (payload.gender_nbr) {
                case 1:
                    payload.gender_desc = "Femenino";
                    break;
                case 2:
                    payload.gender_desc = "Masculino";
                    break;
                case 3:
                    // No asignar texto para la opción 3, mantener null
                    payload.gender_desc = null;
                    break;
                default:
                    payload.gender_desc = null;
            }
        }
        try {
            const created = await this.userRepository.create(payload);
            if (created && created.pass) {
                delete created.pass;
            }
            return { success: true, data: created };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Autenticar por email y password (verifica credenciales básicas)
    async authenticateByEmail(email, password) {
        // Validar entradas
        if (!email || !password) {
            return { success: false, error: "Email y password son requeridos" };
        }
        try {
            const user = await this.userRepository.findByEmail(email);
            // Suponemos que la password está en texto plano para este modo básico. En producción, usar hash.
            if (!user) {
                return { success: false, error: "Credenciales no válidas" };
            }
            const isValid = user.pass === password;
            if (!isValid) {
                return { success: false, error: "Credenciales no válidas" };
            }
            // Ocultar campos sensibles
            if (user.pass) {
                delete user.pass;
            }
            return { success: true, data: user };
        } catch (error) {
            return { success: false, error: error.message };
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
            if (user && user.pass) {
                delete user.pass;
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

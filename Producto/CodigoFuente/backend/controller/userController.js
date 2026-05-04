import { UserService } from "../service/UserService.js";
import { SessionRepository } from "../repository/sessionRepository.js";

export class UserController {
  constructor() {
    this.userService = new UserService();
  }

  // GET /api/users
  // En Hono, el controlador recibe el Context `c`
  async getAllUsers(c) {
    try {
      const result = await this.userService.getAllUsers();

      const status = result.success ? 200 : 400;
      return c.json({
        success: result.success,
        data: result.data,
        total: result.total,
        error: result.error,
      }, status);
    } catch (error) {
      return c.json({
        success: false,
        error: "Error interno del servidor",
        message: error.message,
      }, 500);
    }
  }

  // POST /api/login (inicio de sesión básico por correo y contraseña)
  async login(c) {
    try {
      const { email, password } = await c.req.json();
      const result = await this.userService.authenticateByEmail(email, password);
      const status = result.success ? 200 : 401;
      // Si el login es exitoso, crear una sesión y persistirla en una cookie HttpOnly
      if (result.success) {
        const sessionRepo = new SessionRepository();
        const userId = result.data?.id || result.data?.id_user || result.data?.user_id;
        const token = sessionRepo.createSession(userId);
        // Establecer cookie HttpOnly para mantener la sesión
        c.cookie("session_id", token, { httpOnly: true, path: "/" });
      }
      return c.json(result, status);
    } catch (error) {
      return c.json({ success: false, error: "Error interno del servidor", message: error.message }, 500);
    }
  }
  // GET /api/users/:id
  async getUserById(c) {
    try {
      const id = c.req.param("id");
      const result = await this.userService.getUserById(id);

      const status = result.success ? 200 : 404;
      return c.json(result, status);
    } catch (error) {
      return c.json({
        success: false,
        error: "Error interno del servidor",
        message: error.message,
      }, 500);
    }
  }

  // POST /api/register
  async register(c) {
    try {
      const payload = await c.req.json();
      const result = await this.userService.register(payload);
      const status = result.success ? 201 : 400;
      return c.json(result, status);
    } catch (error) {
      return c.json({ success: false, error: "Error interno del servidor", message: error.message }, 500);
    }
  }
}
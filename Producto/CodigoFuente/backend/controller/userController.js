import { UserService } from "../service/UserService.js";

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
}
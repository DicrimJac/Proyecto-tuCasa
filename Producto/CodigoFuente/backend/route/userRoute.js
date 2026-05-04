import { Hono } from "hono";
import { UserController } from "../controller/userController.js";

// Sub-aplicación de Hono para usuarios.
// En main.ts se monta con: app.route("/api/users", userRoute)
// Por eso aquí las rutas son relativas: "/" y "/:id".

const userRoute = new Hono();
const userController = new UserController();

// GET /api/users
userRoute.get("/", (c) => userController.getAllUsers(c));

// GET /api/users/:id
userRoute.get("/:id", (c) => userController.getUserById(c));

export default userRoute;
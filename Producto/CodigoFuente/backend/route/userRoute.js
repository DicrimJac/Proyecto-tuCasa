import { Hono } from "hono";
import { UserController } from "../controller/userController.js";
import { requireAuth } from "../middleware/auth.js";


const userRoute = new Hono();
const userController = new UserController();

// GET /api/users
userRoute.get("/", requireAuth, (c) => userController.getAllUsers(c));

// POST /api/users - Crear usuario
userRoute.post("/", requireAuth, (c) => userController.createUser(c));

// PUT /api/users/:mail - Actualizar usuario por mail
userRoute.put("/:mail", requireAuth, (c) => userController.updateUserByMail(c));

// DELETE /api/users/:mail - Eliminar usuario por mail
userRoute.delete("/:mail", requireAuth, (c) => userController.deleteUserByMail(c));

// GET /api/users/:id
userRoute.get("/:id", requireAuth, (c) => userController.getUserById(c));

// POST /api/login
userRoute.post("/login", (c) => userController.login(c));

// POST /api/register
userRoute.post("/register", (c) => userController.register(c));

export default userRoute;
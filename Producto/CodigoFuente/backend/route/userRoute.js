import { Hono } from "hono";
import { UserController } from "../controller/userController.js";
import { requireAuth } from "../middleware/auth.js";

const userRoute = new Hono();
const userController = new UserController();

// GET /api/users
userRoute.get("/", requireAuth, (c) => userController.getAllUsers(c));

// GET /api/users/me - Usuario autenticado
userRoute.get("/me", requireAuth, (c) => userController.getCurrentUser(c));

// GET /api/users/email/:mail - Usuario por correo
userRoute.get("/email/:mail", requireAuth, (c) => userController.getUserByEmail(c));

// POST /api/users - Crear usuario
userRoute.post("/", requireAuth, (c) => userController.createUser(c));

// PUT /api/users/:mail/password - Cambiar contraseÃ±a
userRoute.put("/:mail/password", (c) => userController.changePasswordByMail(c));

userRoute.post("/password-reset/request", (c) => userController.requestPasswordReset(c));

userRoute.post("/password-reset/confirm", (c) => userController.confirmPasswordReset(c));

// PUT /api/users/:mail - Actualizar usuario por mail
userRoute.put("/:mail", (c) => userController.updateUserByMail(c));

// DELETE /api/users/:mail - Eliminar usuario por mail
userRoute.delete(
  "/id/:id",
  requireAuth,
  (c) => userController.deleteUserById(c),
);

userRoute.delete(
  "/:mail",
  requireAuth,
  (c) => userController.deleteUserByMail(c),
);

// POST /api/login
userRoute.post("/login", (c) => userController.login(c));

// GET /api/users/google - Iniciar login con Google
userRoute.get("/google", (c) => userController.googleLogin(c));

// GET /api/users/google/callback - Recibir respuesta de Google
userRoute.get("/google/callback", (c) => userController.googleCallback(c));

// POST /api/logout
userRoute.post("/logout", (c) => userController.logout(c));

// POST /api/register
userRoute.post("/register", (c) => userController.register(c));

// GET /api/users/:id
userRoute.get("/:id", requireAuth, (c) => userController.getUserById(c));

export default userRoute;

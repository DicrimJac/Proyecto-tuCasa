import { Hono } from "hono";
import { UserController } from "../controller/userController.js";
import { requireAuth } from "../middleware/auth.js";


const userRoute = new Hono();
const userController = new UserController();

// GET /api/users
userRoute.get("/", requireAuth, (c) => userController.getAllUsers(c));

// GET /api/users/:id
userRoute.get("/:id", requireAuth, (c) => userController.getUserById(c));

// POST /api/login
userRoute.post("/login", (c) => userController.login(c));

// POST /api/register
userRoute.post("/register", (c) => userController.register(c));
// GET /api/login/status (opcional para comprobar sesión, si implementas cookie en futuro)

export default userRoute;
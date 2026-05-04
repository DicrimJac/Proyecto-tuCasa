import { Hono } from "hono";
import { UserController } from "../controller/userController.js";


const userRoute = new Hono();
const userController = new UserController();

// GET /api/users
userRoute.get("/", (c) => userController.getAllUsers(c));

// GET /api/users/:id
userRoute.get("/:id", (c) => userController.getUserById(c));

export default userRoute;
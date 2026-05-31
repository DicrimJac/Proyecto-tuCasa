import { Hono } from "hono";
import { RequestController } from "../controller/requestController.js";
import { requireAuth } from "../middleware/auth.js";

const requestRoute = new Hono();
const requestController = new RequestController();

requestRoute.get("/mine", requireAuth, (c) => requestController.getMyRequests(c));
requestRoute.post("/", requireAuth, (c) => requestController.createRequest(c));

export default requestRoute;

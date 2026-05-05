import { Hono } from "hono";
import { PropertyController } from "../controller/propertyController.js";
import { requireAuth } from "../middleware/auth.js";

const propertyRoute = new Hono();
const propertyController = new PropertyController();

// GET /api/properties
propertyRoute.get("/", requireAuth, (c) => propertyController.getAllProperties(c));
// GET /api/properties/:id
propertyRoute.get("/:id", requireAuth, (c) => propertyController.getPropertyById(c));
// POST /api/properties
propertyRoute.post("/", requireAuth, (c) => propertyController.createProperty(c));
// PUT /api/properties/:id
propertyRoute.put("/:id", requireAuth, (c) => propertyController.updateProperty(c));
// DELETE /api/properties/:id
propertyRoute.delete("/:id", requireAuth, (c) => propertyController.deleteProperty(c));

export default propertyRoute;

import { Hono } from "hono";
import { PropertyController } from "../controller/propertyController.js";
import { requireAuth } from "../middleware/auth.js";
import { handler as analyzeHandler } from "../controller/analyze.ts";

const propertyRoute = new Hono();
const propertyController = new PropertyController();

// GET /api/properties
propertyRoute.get("/", (c) => propertyController.getAllProperties(c));
// GET /api/properties/mine
propertyRoute.get("/mine", requireAuth, (c) => propertyController.getMyProperties(c));
// PATCH /api/properties/:id/status
propertyRoute.patch("/:id/status", requireAuth, (c) => propertyController.updatePropertyStatus(c));
// POST /api/properties/:id/photos
propertyRoute.post("/:id/photos", requireAuth, (c) => propertyController.uploadPropertyPhotos(c));
// GET /api/properties/:id/photos
propertyRoute.get("/:id/photos", (c) => propertyController.getPropertyPhotos(c));
// GET /api/properties/:id
propertyRoute.get("/:id", (c) => propertyController.getPropertyById(c));
// POST /api/properties
propertyRoute.post("/", requireAuth, (c) => propertyController.createProperty(c));
// PUT /api/properties/:id
propertyRoute.put("/:id", requireAuth, (c) => propertyController.updateProperty(c));
// DELETE /api/properties/:id
propertyRoute.delete("/:id", requireAuth, (c) => propertyController.deleteProperty(c));
propertyRoute.post("/analyze", analyzeHandler);
export default propertyRoute;

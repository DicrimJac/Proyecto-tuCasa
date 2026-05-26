import { Hono } from "hono";
import { TenantReviewController } from "../controller/tenantReviewController.js";
import { requireAuth } from "../middleware/auth.js";

const tenantReviewRoute = new Hono();
const tenantReviewController = new TenantReviewController();

tenantReviewRoute.get("/", (c) => tenantReviewController.getAllReviews(c));
tenantReviewRoute.post("/", (c) => tenantReviewController.createReview(c));
tenantReviewRoute.delete("/:id", requireAuth, (c) => tenantReviewController.deleteReview(c));

export default tenantReviewRoute;

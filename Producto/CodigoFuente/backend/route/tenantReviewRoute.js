import { Hono } from "hono";
import { TenantReviewController } from "../controller/tenantReviewController.js";

const tenantReviewRoute = new Hono();
const tenantReviewController = new TenantReviewController();

tenantReviewRoute.get("/", (c) => tenantReviewController.getAllReviews(c));
tenantReviewRoute.post("/", (c) => tenantReviewController.createReview(c));

export default tenantReviewRoute;

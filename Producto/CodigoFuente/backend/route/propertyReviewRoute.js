import { Hono } from "hono";
import { PropertyReviewController } from "../controller/propertyReviewController.js";
import { requireAuth } from "../middleware/auth.js";

const propertyReviewRoute = new Hono();
const propertyReviewController = new PropertyReviewController();

propertyReviewRoute.get("/", (c) => propertyReviewController.getAllReviews(c));
propertyReviewRoute.post("/", (c) => propertyReviewController.createReview(c));
propertyReviewRoute.delete("/:id", requireAuth, (c) => propertyReviewController.deleteReview(c));

export default propertyReviewRoute;

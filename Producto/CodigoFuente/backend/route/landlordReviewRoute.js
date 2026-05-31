import { Hono } from "hono";
import { LandlordReviewController } from "../controller/landlordReviewController.js";
import { requireAuth } from "../middleware/auth.js";

const landlordReviewRoute = new Hono();
const landlordReviewController = new LandlordReviewController();

landlordReviewRoute.get("/", (c) => landlordReviewController.getAllReviews(c));
landlordReviewRoute.post("/", (c) => landlordReviewController.createReview(c));
landlordReviewRoute.delete("/:id", requireAuth, (c) => landlordReviewController.deleteReview(c));

export default landlordReviewRoute;

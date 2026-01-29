import { Router } from "express";
import auth from "../../middleware/auth";
import { reviewController } from "./review.controller";

const router = Router();

// Create / update review for a medicine (authenticated)
router.post("/medicines/:id", auth(), reviewController.createReview);
router.put("/medicines/:id", auth(), reviewController.updateReview);

// Delete a review (authenticated)
router.delete("/:id", auth(), reviewController.deleteReview);

// Read endpoints (public)
router.get("/medicines/:id", reviewController.getReviewsByMedicine);
router.get("/users/:userId", reviewController.getReviewsByUser);
router.get("/:id", reviewController.getReview);

export default router;
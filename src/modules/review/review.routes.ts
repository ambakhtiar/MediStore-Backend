import { Router } from "express";
import auth from "../../middleware/auth";
import { reviewController } from "./review.controller";
import { UserRole } from "../../types";

const router = Router();

// Create / update review for a medicine (authenticated)
router.post("/medicines/:id", auth(UserRole.CUSTOMER), reviewController.createReview);
router.put("/medicines/:id", auth(UserRole.CUSTOMER), reviewController.updateReview);

// Delete a review (authenticated)
router.delete("/:id", auth(), reviewController.deleteReview);

// Read endpoints (public)
router.get("/medicines/:id", reviewController.getReviewsByMedicine);
router.get("/users/:userId", auth(UserRole.CUSTOMER), reviewController.getReviewsByUser);
router.get("/:id", reviewController.getReview);

export const reviewRouter = router;
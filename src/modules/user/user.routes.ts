import { Router } from "express";
import { userController } from "./user.controller";

const router = Router();

// Admin-only routes
router.get("/", userController.getAllUsers);
router.patch("/:id/status", userController.updateUserStatus);

export const userRouter = router;
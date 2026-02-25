import { Router } from "express";
import { userController } from "./user.controller";
import { UserRole } from "../../types";
import auth from "../../middleware/auth";

const router = Router();

// Admin-only routes
router.get("/", auth(UserRole.ADMIN), userController.getAllUsers);
router.patch("/:id/status", auth(UserRole.ADMIN), userController.updateUserStatus);

export const userRouter = router;
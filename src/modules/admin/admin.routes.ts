import express from "express";
import auth from "../../middleware/auth";
import { UserRole } from "../../types";
import { AdminController } from "./admin.controller";

const router = express.Router();

router.get("/stats", auth(UserRole.ADMIN), AdminController.getStats);

export const adminRouter = router;

import { Router } from "express";
import { categoryController } from "./category.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../types";

const router = Router();

// Public
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

// Admin only
router.post("/", auth(UserRole.ADMIN), categoryController.createCategory);
router.put("/:id", auth(UserRole.ADMIN), categoryController.updateCategory);
router.delete("/:id", auth(UserRole.ADMIN), categoryController.deleteCategory);

export const categoryRouter = router;
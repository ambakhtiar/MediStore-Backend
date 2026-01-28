// src/modules/medicine/medicine.routes.ts
import { Router } from "express";
import { UserRole } from "../../types";
import auth from "../../middleware/auth";
import { medicineController } from "./medicine.controller";

const router = Router();

// Public routes
router.get("/", medicineController.getAllMedicines);
router.get("/:id", medicineController.getMedicineById);


// Seller-only routes
router.post("/", auth(UserRole.SELLER), medicineController.addMedicine);
router.put("/:id", auth(UserRole.SELLER), medicineController.updateMedicine);
router.delete("/:id", auth(UserRole.SELLER), medicineController.deleteMedicine);
router.patch("/:id/stock", auth(UserRole.SELLER), medicineController.updateStock);

export const medicineRouter = router;
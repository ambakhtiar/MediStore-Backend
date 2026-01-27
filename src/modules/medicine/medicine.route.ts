import express from "express";
import { medicineController } from "./medicine.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../types";

const router = express.Router();

router.post("/", medicineController.postMedicine);
router.get("/", medicineController.getAllMedicines);

export const medicineRouter = router;
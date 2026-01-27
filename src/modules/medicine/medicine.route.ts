import express from "express";
import { medicineController } from "./medicine.controller";

const router = express.Router();

router.post("/", medicineController.postMedicine);

export const medicineRouter = router;
import express from "express";
import { medicineController } from "../modules/medicine/medicine.controller";

const router = express.Router();

router.post('/medicines', medicineController.postMedicine);

export default router;
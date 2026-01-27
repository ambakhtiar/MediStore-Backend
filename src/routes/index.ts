import express from "express";
import { medicineController } from "../modules/medicine/medicine.controller";
import { medicineRouter } from "../modules/medicine/medicine.route";

const router = express.Router();

router.use('/medicines', medicineRouter);

export default router;
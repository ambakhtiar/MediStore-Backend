import express from "express";
import { medicineRouter } from "../modules/medicine/medicine.route";

const router = express.Router();

router.use('/medicines', medicineRouter);

export default router;
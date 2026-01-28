import express from "express";
import { medicineRouter } from "../modules/medicine/medicine.routes";
import auth from "../middleware/auth";
import { UserRole } from "../types";
import { userRouter } from "../modules/user/user.routes";

const router = express.Router();

router.use('/medicines', medicineRouter);
router.use('/admin/user', auth(UserRole.ADMIN), userRouter);

export default router;
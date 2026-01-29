import express from "express";
import { medicineRouter } from "../modules/medicine/medicine.routes";
import auth from "../middleware/auth";
import { UserRole } from "../types";
import { userRouter } from "../modules/user/user.routes";
import { categoryRouter } from "../modules/category/category.routes";
import { profileRouter } from "../modules/profile/profile.routes";
import { cartRouter } from "../modules/cart/cart.routes";
import { orderRouter } from "../modules/order/order.routes";

const router = express.Router();

router.use('/medicines', medicineRouter);
router.use('/categories', categoryRouter);
router.use('/profile', profileRouter);
router.use('/cart', cartRouter);
router.use('/order', orderRouter);
router.use('/admin/users', auth(UserRole.ADMIN), userRouter);


export default router;
import { Router } from "express";
import { orderController } from "./order.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../types";

const router = Router();

// Customer endpoints
router.post("/", auth(UserRole.CUSTOMER), orderController.createOrder);
router.get("/", auth(), orderController.listOrders);
router.get("/:id", auth(), orderController.getOrder);
router.get("/:id/track", auth(), orderController.getOrderStatus);
router.patch("/:id/cancel", auth(), orderController.cancelOrderByCustomer);

// Seller/Admin: update order status
// router.ts (বা যেখানে রাউট ডিফাইন করেন)
router.patch("/seller/order-item/:id/status", auth(UserRole.SELLER), orderController.updateOrderItemStatusBySeller);
router.patch("/admin/order/:id/status", auth(UserRole.ADMIN), orderController.updateOrderStatusByAdmin);

export const orderRouter = router;
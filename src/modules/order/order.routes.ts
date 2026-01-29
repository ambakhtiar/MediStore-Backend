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
router.patch("/seller/:id/status", auth(UserRole.SELLER, UserRole.ADMIN), orderController.updateOrderStatusByActor);

export const orderRouter = router;
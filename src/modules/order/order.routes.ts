import { Router } from "express";
import { orderController } from "./order.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../types";

const router = Router();

// Customer endpoints
router.post("/", auth(UserRole.CUSTOMER), orderController.createOrder);
router.get("/", auth(), orderController.listOrders);
router.get("/delivered-medicines", auth(), orderController.getDeliveredMedicinesForReview);
router.get("/:id", auth(), orderController.getOrder);
router.get("/:id/track", auth(), orderController.getOrderStatus);
router.patch("/:id/cancel", auth(), orderController.cancelOrderByCustomer);
router.get("/:id/status-history", auth(), orderController.getOrderStatusHistory);

// Seller/Admin: update order status
router.patch("/seller/order-item/:id/status", auth(UserRole.SELLER), orderController.updateOrderItemStatusBySeller);
router.patch("/admin/order/:id/status", auth(UserRole.ADMIN), orderController.updateOrderStatusByAdmin);

export const orderRouter = router;
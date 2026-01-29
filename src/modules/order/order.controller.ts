import { Request, Response } from "express";
import { orderService, ServiceError } from "./order.service";

const send = (res: Response, code: number, message: string, data?: any) =>
    res.status(code).json({ message, data });

const sendError = (res: Response, err: any, fallback: string) => {
    const status = err instanceof ServiceError ? err.statusCode : 500;
    const message = err?.message || fallback;
    return res.status(status).json({ message });
};

const createOrder = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return send(res, 401, "Unauthorized");

        const { shippingName, shippingPhone, shippingAddress } = req.body ?? {};
        const order = await orderService.createOrder(userId, {
            shippingName,
            shippingPhone,
            shippingAddress,
        });

        return send(res, 201, "Order placed successfully", order);
    } catch (err) {
        return sendError(res, err, "Failed to place order");
    }
};

const listOrders = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user?.id) return send(res, 401, "Unauthorized");

        const orders = await orderService.listOrders(user);
        return send(res, 200, "Orders fetched", orders);
    } catch (err) {
        return sendError(res, err, "Failed to fetch orders");
    }
};

const getOrder = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user?.id) return send(res, 401, "Unauthorized");

        const orderId = req.params.id;
        const order = await orderService.getOrder(user, orderId as string);
        return send(res, 200, "Order fetched", order);
    } catch (err) {
        return sendError(res, err, "Failed to fetch order");
    }
};

/**
 * POST /api/orders/:id/cancel
 * Customer cancels their own order if allowed (before confirm/processing).
 */
const cancelOrderByCustomer = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user?.id) return send(res, 401, "Unauthorized");

        const orderId = req.params.id;
        const updated = await orderService.cancelOrderByCustomer(user, orderId as string);
        return send(res, 200, "Order cancelled", updated);
    } catch (err) {
        return sendError(res, err, "Failed to cancel order");
    }
};

/**
 * PATCH /api/orders/:id/status
 * Seller or Admin updates order status (body: { status })
 */
const updateOrderStatusByActor = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user?.id) return send(res, 401, "Unauthorized");

        const orderId = req.params.id;
        const { status } = req.body ?? {};
        if (!status) return send(res, 400, "status is required");

        const updated = await orderService.updateOrderStatusByActor(user, orderId as string, status);
        return send(res, 200, "Order status updated", updated);
    } catch (err) {
        return sendError(res, err, "Failed to update order status");
    }
};

const getOrderStatus = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user?.id) return send(res, 401, "Unauthorized");

        const orderId = req.params.id;
        const status = await orderService.getOrderStatus(orderId as string);
        return send(res, 200, "Order fetched", status);
    } catch (err) {
        return sendError(res, err, "Failed to fetch order");
    }
};


export const orderController = {
    createOrder,
    listOrders,
    getOrder,
    cancelOrderByCustomer,
    updateOrderStatusByActor,
    getOrderStatus
};
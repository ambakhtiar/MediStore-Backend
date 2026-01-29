import { Request, Response } from "express";
import { cartService, ServiceError } from "./cart.service";

const send = (res: Response, code: number, message: string, data?: any) =>
    res.status(code).json({ message, data });

const sendError = (res: Response, err: any, fallback: string) => {
    const status = err instanceof ServiceError ? err.statusCode : 500;
    const message = err?.message || fallback;
    return res.status(status).json({ message });
};

const addMedicineToCart = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return send(res, 401, "Unauthorized");

        const { medicineId, quantity } = req.body ?? {};
        const item = await cartService.addMedicineToCart(userId, { medicineId, quantity });
        return send(res, 201, "Item added to cart", item);
    } catch (err) {
        return sendError(res, err, "Failed to add item to cart");
    }
};

const getCart = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return send(res, 401, "Unauthorized");

        const cart = await cartService.getCart(userId);
        return send(res, 200, "Cart fetched", cart);
    } catch (err) {
        return sendError(res, err, "Failed to fetch cart");
    }
};

const updateItem = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return send(res, 401, "Unauthorized");

        const cartItemId = req.params.id;
        const { quantity } = req.body ?? {};
        const updated = await cartService.updateItem(userId, cartItemId as string, quantity);
        return send(res, 200, "Cart item updated", updated);
    } catch (err) {
        return sendError(res, err, "Failed to update cart item");
    }
};

const removeItem = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return send(res, 401, "Unauthorized");

        const cartItemId = req.params.id;
        await cartService.removeItem(userId, cartItemId as string);
        return send(res, 200, "Cart item removed");
    } catch (err) {
        return sendError(res, err, "Failed to remove cart item");
    }
};

export const cartController = {
    addMedicineToCart,
    getCart,
    updateItem,
    removeItem,
};
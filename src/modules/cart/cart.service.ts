import { prisma } from "../../lib/prisma";

export class ServiceError extends Error {
    statusCode: number;
    constructor(message: string, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, ServiceError.prototype);
    }
}

type AddMedicineType = {
    medicineId?: string;
    quantity?: number;
};

type CartItemResponse = {
    id: string;
    quantity: number;
    unitPrice: number;
    medicine: {
        id: string;
        name: string;
        genericName?: string | null;
        imageUrl?: string | null;
        manufacturer?: string | null;
        isActive: boolean;
        stock: number;
    };
    createdAt: string;
    updatedAt: string;
};

/**
 * Add item to cart (create cart if not exists). If item exists, increment quantity.
 * Uses transaction to ensure consistency.
*/
const addMedicineToCart = async (userId: string, data: AddMedicineType): Promise<CartItemResponse> => {
    const { medicineId, quantity } = data;

    if (!medicineId || typeof medicineId !== "string") {
        throw new ServiceError("medicineId is required", 400);
    }
    const qty = Number(quantity ?? 1);
    if (!Number.isInteger(qty) || qty <= 0) {
        throw new ServiceError("quantity must be a positive integer", 400);
    }

    try {
        return await prisma.$transaction(async (tx) => {
            // load medicine
            const medicine = await tx.medicine.findUnique({
                where: { id: medicineId },
                select: {
                    id: true,
                    name: true,
                    genericName: true,
                    imageUrl: true,
                    manufacturer: true,
                    price: true,
                    stock: true,
                    isActive: true,
                    categoryId: true,
                    sellerId: true
                },
            });

            if (!medicine) throw new ServiceError("Medicine not found", 404);
            if (!medicine.isActive) throw new ServiceError("Medicine is not available", 400);

            // ensure cart exists
            let cart = await tx.cart.findUnique({ where: { userId } });
            if (!cart) {
                cart = await tx.cart.create({ data: { userId } });
            }

            // check existing cart item
            const existing = await tx.cartItem.findUnique({
                where: { cartId_medicineId: { cartId: cart.id, medicineId } },
            });

            const currentUnitPrice = medicine.price;

            if (existing) {
                const newQty = existing.quantity + qty;
                if (newQty > medicine.stock) throw new ServiceError("Requested quantity exceeds stock", 409);

                const updated = await tx.cartItem.update({
                    where: { id: existing.id },
                    data: {
                        quantity: newQty,
                        unitPrice: currentUnitPrice,
                    },
                    include: {
                        medicine: {
                            select: {
                                id: true,
                                name: true,
                                genericName: true,
                                imageUrl: true,
                                manufacturer: true,
                                isActive: true,
                                stock: true,
                                categoryId: true,
                                sellerId: true
                            },
                        },
                    },
                });

                return formatCartItem(updated);
            }

            // new cart item
            if (qty > medicine.stock) throw new ServiceError("Requested quantity exceeds stock", 409);

            const created = await tx.cartItem.create({
                data: {
                    cartId: cart.id,
                    medicineId,
                    quantity: qty,
                    unitPrice: currentUnitPrice,
                },
                include: {
                    medicine: {
                        select: {
                            id: true,
                            name: true,
                            genericName: true,
                            imageUrl: true,
                            manufacturer: true,
                            isActive: true,
                            stock: true,
                            categoryId: true,
                            sellerId: true
                        },
                    },
                },
            });

            return formatCartItem(created);
        });
    } catch (err: any) {
        if (err instanceof ServiceError) throw err;
        console.error("addItem error:", err);
        throw new ServiceError("Failed to add item to cart", 500);
    }
};


const getCart = async (userId: string) => {
    try {
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        medicine: {
                            select: {
                                id: true,
                                name: true,
                                genericName: true,
                                imageUrl: true,
                                manufacturer: true,
                                price: true,
                                stock: true,
                                isActive: true,
                                categoryId: true,
                                sellerId: true
                            },
                        },
                    },
                },
            },
        });

        if (!cart) {
            return { items: [], subtotal: 0 };
        }

        // compute subtotal using stored unitPrice (but ensure unitPrice matches current medicine.price if needed)
        const items = cart.items.map((it) => ({
            id: it.id,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            medicine: {
                id: it.medicine.id,
                name: it.medicine.name,
                genericName: it.medicine.genericName,
                imageUrl: it.medicine.imageUrl,
                manufacturer: it.medicine.manufacturer,
                isActive: it.medicine.isActive,
                stock: it.medicine.stock,
                categoryId: it.medicine.categoryId,
                sellerId: it.medicine.sellerId
            },
            createdAt: it.createdAt,
            updatedAt: it.updatedAt,
        }));

        const subtotal = items.reduce((total, it) => total + it.unitPrice * it.quantity, 0);

        return { items, subtotal };
    } catch (err: any) {
        console.error("getCart error:", err);
        throw new ServiceError("Failed to fetch cart", 500);
    }
};

/**
 * Update cart item quantity. If quantity === 0 => delete item.
 * Validate stock before update.
 */
const updateItem = async (userId: string, cartItemId: string, quantity?: number) => {
    if (!cartItemId) throw new ServiceError("cart item id is required", 400);
    if (quantity === undefined || quantity === null) throw new ServiceError("quantity is required", 400);
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 0) throw new ServiceError("quantity must be a non-negative integer", 400);

    try {
        return await prisma.$transaction(async (tx) => {
            // ensure cart item belongs to user's cart
            const cartItem = await tx.cartItem.findUnique({
                where: { id: cartItemId },
                include: {
                    cart: { select: { userId: true, id: true } },
                    medicine: { select: { id: true, stock: true, price: true, isActive: true, name: true, genericName: true, imageUrl: true, manufacturer: true } },
                },
            });

            if (!cartItem) throw new ServiceError("Cart item not found", 404);
            if (cartItem.cart.userId !== userId) throw new ServiceError("Unauthorized", 403);

            if (!cartItem.medicine.isActive) throw new ServiceError("Medicine is not available", 400);

            if (qty === 0) {
                await tx.cartItem.delete({ where: { id: cartItemId } });
                return { deleted: true };
            }

            if (qty > cartItem.medicine.stock) throw new ServiceError("Requested quantity exceeds stock", 409);

            const updated = await tx.cartItem.update({
                where: { id: cartItemId },
                data: { quantity: qty, unitPrice: cartItem.medicine.price },
                include: {
                    medicine: {
                        select: {
                            id: true,
                            name: true,
                            genericName: true,
                            imageUrl: true,
                            manufacturer: true,
                            isActive: true,
                            stock: true,
                            categoryId: true,
                            sellerId: true
                        },
                    },
                },
            });

            return formatCartItem(updated);
        });
    } catch (err: any) {
        if (err instanceof ServiceError) throw err;
        console.error("updateItem error:", err);
        throw new ServiceError("Failed to update cart item", 500);
    }
};

/**
 * Remove cart item
 */
const removeItem = async (userId: string, cartItemId: string) => {
    if (!cartItemId) throw new ServiceError("cart item id is required", 400);

    try {
        // ensure ownership then delete
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: cartItemId },
            include: { cart: { select: { userId: true } } },
        });
        if (!cartItem) throw new ServiceError("Cart item not found", 404);
        if (cartItem.cart.userId !== userId) throw new ServiceError("Unauthorized", 403);

        await prisma.cartItem.delete({ where: { id: cartItemId } });
        return;
    } catch (err: any) {
        if (err instanceof ServiceError) throw err;
        console.error("removeItem error:", err);
        throw new ServiceError("Failed to remove cart item", 500);
    }
};

/** helper to format cart item response */
const formatCartItem = (ci: any) => ({
    id: ci.id,
    quantity: ci.quantity,
    unitPrice: ci.unitPrice,
    medicine: {
        id: ci.medicine.id,
        name: ci.medicine.name,
        genericName: ci.medicine.genericName,
        imageUrl: ci.medicine.imageUrl,
        manufacturer: ci.medicine.manufacturer,
        isActive: ci.medicine.isActive,
        stock: ci.medicine.stock,
    },
    createdAt: ci.createdAt,
    updatedAt: ci.updatedAt,
});

export const cartService = {
    addMedicineToCart,
    getCart,
    updateItem,
    removeItem,
};
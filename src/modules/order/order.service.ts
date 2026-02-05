import { prisma } from "../../lib/prisma";
import type { User } from "../../generated/prisma/client";

export class ServiceError extends Error {
    statusCode: number;
    constructor(message: string, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, ServiceError.prototype);
    }
}

type CreateOrderType = {
    shippingName?: string;
    shippingPhone?: string;
    shippingAddress?: string;
};

// ** Allowed transitions map(source -> allowed next states) */s
const VALID_TRANSITIONS: Record<string, string[]> = {
    PLACED: ["PROCESSING", "CANCELLED", "CONFIRMS"],
    CONFIRMS: ["PROCESSING", "CANCELLED"],
    PROCESSING: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: [],
};

/** Helper: normalize status */
const normalizeStatus = (s: string) => String(s ?? "").toUpperCase();

/**
 * Create order from user's cart (Cash on Delivery).
 * - Validate address
 * - Load cart + medicines
 * - Validate stock
 * - Create Order + OrderItems, decrement stock, clear cart in a single transaction
 */
const createOrder = async (userId: string, data: CreateOrderType) => {
    const { shippingName, shippingPhone, shippingAddress } = data;

    if (!shippingAddress || typeof shippingAddress !== "string" || shippingAddress.trim() === "") {
        throw new ServiceError("Active shippingPhone number & shippingAddress is required", 400);
    }
    if (!shippingPhone || typeof shippingPhone !== "string" || shippingPhone.trim() === "") {
        throw new ServiceError("Active shippingPhone number & shippingAddress is required", 409)
    }

    try {
        return await prisma.$transaction(async (tx) => {
            // load cart with items and medicine
            const cart = await tx.cart.findUnique({
                where: { userId },
                include: {
                    items: {
                        include: {
                            medicine: {
                                select: { id: true, price: true, stock: true, isActive: true, sellerId: true, name: true },
                            },
                        },
                    },
                },
            });

            if (!cart || cart.items.length === 0) {
                throw new ServiceError("Cart is empty", 400);
            }

            // validate each item
            for (const item of cart.items) {
                const med = item.medicine;
                if (!med) throw new ServiceError(`Medicine not found for cart item ${item.id}`, 404);
                if (!med.isActive) throw new ServiceError(`Medicine ${med.name} is not available`, 400);
                if (item.quantity > med.stock) {
                    throw new ServiceError(`Insufficient stock for ${med.name}`, 409);
                }
            }

            // compute total
            const total = cart.items.reduce((total, it) => total + it.medicine.price * it.quantity, 0);

            // create order
            const order = await tx.order.create({
                data: {
                    userId,
                    total,
                    shippingName: shippingName ?? null,
                    shippingPhone,
                    shippingAddress,

                },
            });

            // create order items and decrement stock
            const orderItemCreates = cart.items.map((it) =>
                tx.orderItem.create({
                    data: {
                        orderId: order.id,
                        medicineId: it.medicine.id,
                        quantity: it.quantity,
                        unitPrice: it.medicine.price,
                    },
                })
            );

            // decrement stock operations
            const stockUpdates = cart.items.map((it) =>
                tx.medicine.update({
                    where: { id: it.medicine.id },
                    data: { stock: { decrement: it.quantity } },
                })
            );

            // execute creations and stock updates
            await Promise.all([...orderItemCreates, ...stockUpdates]);

            // clear cart items (delete)
            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

            // optional: delete cart record itself
            // await tx.cart.delete({ where: { id: cart.id } });

            // fetch full order to return
            const created = await tx.order.findUnique({
                where: { id: order.id },
                include: {
                    items: {
                        include: {
                            medicine: { select: { id: true, name: true, imageUrl: true, manufacturer: true } },
                        },
                    },
                    user: { select: { id: true, name: true, email: true } },
                },
            });

            // log for audit (simple console; replace with structured logger)
            console.info(`Order created: ${order.id} by user ${userId} total=${total}`);

            // placeholder: notify (email/webhook)
            // notifyOrderCreated(created);

            return created;
        });
    } catch (err: any) {
        if (err instanceof ServiceError) throw err;
        console.error("createOrder error:", err);
        // map Prisma unique/constraint errors if needed
        throw new ServiceError("Failed to create order", 500);
    }
};

/**
 * List orders:
 * - If admin: return all orders (with pagination)
 * - If seller: return orders that contain medicines sold by this seller
 * - If customer: return user's orders
 */
const listOrders = async (user: User, opts: { skip?: number; take?: number } = {}) => {
    try {
        const { skip = 0, take = 50 } = opts;

        if (user.role === "ADMIN") {
            const orders = await prisma.order.findMany({
                skip,
                take,
                orderBy: { createdAt: "desc" },
                include: { items: { include: { medicine: true } }, user: { select: { id: true, name: true, email: true } } },
            });
            return orders;
        }

        if (user.role === "SELLER") {
            // find orders that include at least one medicine from this seller
            const orders = await prisma.order.findMany({
                skip,
                take,
                where: {
                    items: {
                        some: {
                            medicine: { sellerId: user.id },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                include: { items: { include: { medicine: true } }, user: { select: { id: true, name: true } } },
            });
            return orders;
        }

        // CUSTOMER
        const orders = await prisma.order.findMany({
            skip,
            take,
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            include: { items: { include: { medicine: true } } },
        });
        return orders;
    } catch (err: any) {
        console.error("listOrders error:", err);
        throw new ServiceError("Failed to list orders", 500);
    }
};

/**
 * Get single order with authorization:
 * - admin: any
 * - seller: only if order contains seller's medicine
 * - customer: only own orders
 */
const getOrder = async (user: User, orderId: string) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { medicine: true } }, user: { select: { id: true, name: true, email: true } } },
        });
        if (!order) throw new ServiceError("Order not found", 404);

        if (user.role === "ADMIN") return order;

        if (user.role === "SELLER") {
            const hasSellerItem = order.items.some((it) => it.medicine.sellerId === user.id);
            if (!hasSellerItem) throw new ServiceError("Unauthorized", 403);
            return order;
        }

        // CUSTOMER
        if (order.userId !== user.id) throw new ServiceError("Unauthorized", 403);
        return order;
    } catch (err: any) {
        if (err instanceof ServiceError) throw err;
        console.error("getOrder error:", err);
        throw new ServiceError("Failed to fetch order", 500);
    }
};

/**
 * Customer cancels their own order.
 * - Allowed only when current status is PLACED (before confirm/processing).
 * - Restores stock for each order item.
 * - Runs in a transaction.
 */
const cancelOrderByCustomer = async (user: User, orderId: string) => {
    const upper = normalizeStatus("CANCELLED");
    try {
        return await prisma.$transaction(async (tx) => {
            // load order with items and medicine
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: {
                    items: { include: { medicine: { select: { id: true, name: true, stock: true, sellerId: true } } } },
                },
            });
            if (!order) throw new ServiceError("Order not found", 404);

            // ownership check
            if (order.userId !== user.id) throw new ServiceError("Unauthorized", 403);

            const current = order.status;

            // allow cancel only when order is PLACED (before confirm/processing)
            if (current !== "PLACED") {
                throw new ServiceError("You can cancel the order only before it is confirmed or processed by seller", 400);
            }

            // restock each medicine (because stock was decremented at order creation)
            for (const it of order.items) {
                await tx.medicine.update({
                    where: { id: it.medicine.id },
                    data: { stock: { increment: it.quantity } },
                });
            }

            // update order status to CANCELLED
            const updated = await tx.order.update({
                where: { id: orderId },
                data: { status: upper as any },
                include: { items: { include: { medicine: true } }, user: { select: { id: true, name: true, email: true } } },
            });

            console.info(`Order ${orderId} cancelled by customer ${user.id}`);
            // placeholder: notifyCustomerAndSellers(updated);

            return updated;
        });
    } catch (err: any) {
        if (err instanceof ServiceError) throw err;
        console.error("cancelOrderByCustomer error:", err);
        throw new ServiceError("Failed to cancel order", 500);
    }
};

/**
 * Seller or Admin updates order status.
 * - Seller must own at least one item in the order.
 * - Admin can update any order.
 * - Enforces VALID_TRANSITIONS.
 * - If status becomes CANCELLED, prevents cancellation after SHIPPED/DELIVERED.
 * - Runs in a transaction.
**/
const updateOrderStatusByActor = async (user: User, orderId: string, newStatus: string) => {
    const upper = normalizeStatus(newStatus);
    const VALID_STATUSES = Object.keys(VALID_TRANSITIONS);

    if (!VALID_STATUSES.includes(upper)) {
        throw new ServiceError("Invalid status", 400);
    }

    try {
        return await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: {
                    items: { include: { medicine: { select: { id: true, sellerId: true, name: true } } } },
                },
            });
            if (!order) throw new ServiceError("Order not found", 404);

            // Authorization:
            if (user.role === "SELLER") {
                const owns = order.items.map((it) => it.medicine.sellerId === user.id);
                if (!owns) throw new ServiceError("Unauthorized: you don't own items in this order", 403);
            } else if (user.role !== "ADMIN") {
                throw new ServiceError("Unauthorized", 403);
            }

            const current = order.status;
            if (current === upper) {
                // no-op: return fresh order
                return await tx.order.findUnique({
                    where: { id: orderId },
                    include: { items: { include: { medicine: true } }, user: { select: { id: true, name: true, email: true } } },
                });
            }

            // Prevent cancellation after shipped/delivered
            if (upper === "CANCELLED" && ["SHIPPED", "DELIVERED"].includes(current)) {
                throw new ServiceError("Cannot cancel order after it has been shipped or delivered", 400);
            }

            // Validate transition using state machine
            const allowed = VALID_TRANSITIONS[current] ?? [];
            if (!allowed.includes(upper)) {
                throw new ServiceError(`Invalid status transition from ${current} to ${upper}`, 400);
            }

            const updated = await tx.order.update({
                where: { id: orderId },
                data: { status: upper as any },
                include: { items: { include: { medicine: true } }, user: { select: { id: true, name: true, email: true } } },
            });

            // console.info(`Order ${orderId} status changed ${current} -> ${upper} by ${user.id} (${user.role})`);

            return updated;
        });
    } catch (err: any) {
        if (err instanceof ServiceError) throw err;
        console.error("updateOrderStatusByActor error:", err);
        throw new ServiceError("Failed to update order status", 500);
    }
};

const getOrderStatus = async (orderId: string) => {
    try {
        const result = await prisma.order.findUnique({
            where: {
                id: orderId
            },
            select: {
                status: true
            }
        })

        return result;
    } catch (err: any) {
        if (err instanceof ServiceError) throw err;
        console.error("getOrderStatus error:", err);
        throw new ServiceError("Failed to get order status", 500);
    }
}


export const orderService = {
    createOrder,
    listOrders,
    getOrder,
    cancelOrderByCustomer,
    updateOrderStatusByActor,
    getOrderStatus
};
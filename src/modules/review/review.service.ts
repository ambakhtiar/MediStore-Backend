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

type ReviewType = {
    rating?: any;
    comment?: string | null;
};

type PaginationType = {
    page: number,
    limit: number,
    skip: number,
    sortBy: string,
    sortOrder: string,
}

const validateRating = (r: any) => {
    const n = Number(r);
    if (!Number.isInteger(n) || n < 1 || n > 5) {
        throw new ServiceError("rating must be an integer between 1 and 5", 400);
    }
    return n;
};


const createReview = async (userId: string, medicineId: string, data: ReviewType) => {
    const rating = validateRating(data.rating);
    const comment = data.comment ?? null;

    try {
        return await prisma.$transaction(async (tx) => {
            // ensure medicine exists 
            const medicine = await tx.medicine.findUnique({ where: { id: medicineId } });
            if (!medicine) throw new ServiceError("Medicine not found", 404);

            // ensure user has a DELIVERED order containing this medicine
            const delivered = await tx.order.findFirst({
                where: {
                    userId,
                    status: "DELIVERED",
                    items: { some: { medicineId } },
                },
                select: { id: true },
            });
            if (!delivered) {
                throw new ServiceError("You can only review medicines you have received (DELIVERED)", 403);
            }

            // check existing review
            const existing = await tx.review.findUnique({
                where: { userId_medicineId: { userId, medicineId } },
            });
            if (existing) {
                throw new ServiceError("Review already exists. Use PUT to update.", 409);
            }

            // create review
            const created = await tx.review.create({
                data: {
                    userId,
                    medicineId,
                    rating,
                    comment,
                },
            });

            // aggregate meta
            const agg = await tx.review.aggregate({
                where: { medicineId },
                _avg: { rating: true },
                _count: { rating: true },
            });

            const averageRating = agg._avg.rating ?? null;
            const reviewCount = agg._count.rating ?? 0;

            return { review: created, meta: { averageRating, reviewCount } };
        });
    } catch (err: any) {
        if (err instanceof ServiceError) throw err;
        console.error("createReview error:", err);
        throw new ServiceError("Failed to create review", 500);
    }
};


const updateReview = async (user: User, medicineId: string, data: ReviewType) => {
    const rating = data.rating !== undefined ? validateRating(data.rating) : undefined;
    const comment = data.comment ?? undefined;

    try {
        return await prisma.$transaction(async (tx) => {
            const existing = await tx.review.findUnique({
                where: { userId_medicineId: { userId: user.id, medicineId } },
            });
            if (!existing) throw new ServiceError("Review not found", 404);

            // only owner or admin can update
            if (user.role !== "ADMIN" && existing.userId !== user.id) {
                throw new ServiceError("Unauthorized", 403);
            }

            const data: any = {};
            if (rating !== undefined) data.rating = rating;
            if (comment !== undefined) data.comment = comment;

            const updated = await tx.review.update({
                where: { id: existing.id },
                data
            });

            const agg = await tx.review.aggregate({
                where: { medicineId },
                _avg: { rating: true },
                _count: { rating: true },
            });

            const averageRating = agg._avg.rating ?? null;
            const reviewCount = agg._count.rating ?? 0;

            return { review: updated, meta: { averageRating, reviewCount } };
        });
    } catch (err: any) {
        if (err instanceof ServiceError) throw err;
        console.error("updateReview error:", err);
        throw new ServiceError("Failed to update review", 500);
    }
};


const deleteReview = async (user: User, reviewId: string) => {
    try {
        return await prisma.$transaction(async (tx) => {
            const existing = await tx.review.findUnique({
                where: { id: reviewId },
            });
            if (!existing) throw new ServiceError("Review not found", 404);

            if (user.role !== "ADMIN" && existing.userId !== user.id) {
                throw new ServiceError("Unauthorized", 403);
            }

            await tx.review.delete({ where: { id: reviewId } });

            // optional: recompute average for the medicine and return it (not required)
            return;
        });
    } catch (err: any) {
        if (err instanceof ServiceError) throw err;
        console.error("deleteReview error:", err);
        throw new ServiceError("Failed to delete review", 500);
    }
};


const getReviewsByMedicine = async (medicineId: string, opts: PaginationType) => {
    const { page, limit, skip, sortBy, sortOrder } = opts;
    try {
        const [reviews, agg] = await Promise.all([
            prisma.review.findMany({
                where: { medicineId },
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: { user: { select: { id: true, name: true, image: true } } },
            }),
            prisma.review.aggregate({
                where: { medicineId },
                _avg: { rating: true },
                _count: { rating: true },
            }),
        ]);

        return {
            reviews,
            meta: {
                averageRating: agg._avg.rating ?? null,
                reviewCount: agg._count.rating ?? 0,
            },
        };
    } catch (err: any) {
        console.error("listReviewsByMedicine error:", err);
        throw new ServiceError("Failed to list reviews", 500);
    }
};


const getReviewsByUser = async (userId: string, opts: PaginationType) => {
    const { page, limit, skip, sortBy, sortOrder } = opts;
    try {
        const reviews = await prisma.review.findMany({
            where: { userId },
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: { medicine: { select: { id: true, name: true, imageUrl: true } } },
        });
        return { reviews };
    } catch (err: any) {
        console.error("listReviewsByUser error:", err);
        throw new ServiceError("Failed to list user reviews", 500);
    }
};


const getReview = async (id: string) => {
    try {
        const review = await prisma.review.findUnique({
            where: { id },
            include: { user: { select: { id: true, name: true } }, medicine: { select: { id: true, name: true } } },
        });
        if (!review) throw new ServiceError("Review not found", 404);
        return review;
    } catch (err: any) {
        if (err instanceof ServiceError) throw err;
        console.error("getReview error:", err);
        throw new ServiceError("Failed to fetch review", 500);
    }
};

export const reviewService = {
    createReview,
    updateReview,
    deleteReview,
    getReviewsByMedicine,
    getReviewsByUser,
    getReview,
};
import { Request, Response } from "express";
import { reviewService, ServiceError } from "./review.service";
import paginationSortingHelpers from "../../helpers/paginationSortingHelpers";

const send = (res: Response, code: number, message: string, data?: any) =>
    res.status(code).json({ message, data });

const sendError = (res: Response, err: any, fallback: string) => {
    const status = err instanceof ServiceError ? err.statusCode : 500;
    const message = err?.message || fallback;
    return res.status(status).json({ message });
};

const createReview = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user?.id) return send(res, 401, "Unauthorized");

        const medicineId = req.params.id;
        const { rating, comment } = req.body ?? {};

        const result = await reviewService.createReview(user.id, medicineId as string, { rating, comment });
        return send(res, 201, "Review created", result);
    } catch (err) {
        return sendError(res, err, "Failed to create review");
    }
};

const updateReview = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user) return send(res, 401, "Unauthorized");

        const medicineId = req.params.id;
        const { rating, comment } = req.body ?? {};

        const result = await reviewService.updateReview(user, medicineId as string, { rating, comment });
        return send(res, 200, "Review updated", result);
    } catch (err) {
        return sendError(res, err, "Failed to update review");
    }
};

const deleteReview = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user?.id) return send(res, 401, "Unauthorized");

        const reviewId = req.params.id;
        await reviewService.deleteReview(user, reviewId as string);
        return send(res, 200, "Review deleted");
    } catch (err) {
        return sendError(res, err, "Failed to delete review");
    }
};

const getReviewsByMedicine = async (req: Request, res: Response) => {
    try {
        const medicineId = req.params.id;
        const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelpers(req.query);

        const data = await reviewService.getReviewsByMedicine(medicineId as string, { page, limit, skip, sortBy, sortOrder });
        return send(res, 200, "Reviews fetched", data);
    } catch (err) {
        return sendError(res, err, "Failed to fetch reviews");
    }
};

const getReviewsByUser = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelpers(req.query);

        const data = await reviewService.getReviewsByUser(userId as string, { page, limit, skip, sortBy, sortOrder });
        return send(res, 200, "User reviews fetched", data);
    } catch (err) {
        return sendError(res, err, "Failed to fetch user reviews");
    }
};

const getReview = async (req: Request, res: Response) => {
    try {
        const reviewId = req.params.id;
        const review = await reviewService.getReview(reviewId as string);
        return send(res, 200, "Review fetched", review);
    } catch (err) {
        return sendError(res, err, "Failed to fetch review");
    }
};

export const reviewController = {
    createReview,
    updateReview,
    deleteReview,
    getReviewsByMedicine,
    getReviewsByUser,
    getReview,
};
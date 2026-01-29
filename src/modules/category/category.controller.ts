import { Request, Response } from "express";
import { categoryService, ServiceError } from "./category.service";

const send = (res: Response, code: number, message: string, data?: any) =>
    res.status(code).json({ message, data });

const sendError = (res: Response, err: any, fallback: string) => {
    const status = err instanceof ServiceError ? err.statusCode : 500;
    const message = err?.message || fallback;
    return res.status(status).json({ message });
};

// Public
const getAllCategories = async (_req: Request, res: Response) => {
    try {
        const categories = await categoryService.getAllCategories();
        return send(res, 200, "Categories fetched successfully", categories);
    } catch (err) {
        return sendError(res, err, "Failed to fetch categories");
    }
};

const getCategoryById = async (req: Request, res: Response) => {
    try {
        const category = await categoryService.getCategoryById(req.params.id as string);
        if (!category) return send(res, 404, "Category not found");
        return send(res, 200, "Category fetched successfully", category);
    } catch (err) {
        return sendError(res, err, "Failed to fetch category");
    }
};

// Admin only
const createCategory = async (req: Request, res: Response) => {
    try {
        const { name, slug, description, isPrescriptionRequired } = req.body;
        if (!name || typeof name !== "string") return send(res, 400, "Name is required");

        const category = await categoryService.createCategory({ name, slug, description, isPrescriptionRequired });
        return send(res, 201, "Category created successfully", category);
    } catch (err) {
        return sendError(res, err, "Failed to create category");
    }
};

const updateCategory = async (req: Request, res: Response) => {
    try {
        const { name, slug, description, isPrescriptionRequired } = req.body;
        const updated = await categoryService.updateCategory(req.params.id as string, { name, slug, description, isPrescriptionRequired });
        return send(res, 200, "Category updated successfully", updated);
    } catch (err) {
        return sendError(res, err, "Failed to update category");
    }
};

const deleteCategory = async (req: Request, res: Response) => {
    try {
        const data = await categoryService.deleteCategory(req.params.id as string);
        return send(res, 200, "Category deleted successfully", data);
    } catch (err) {
        return sendError(res, err, "Failed to delete category");
    }
};

export const categoryController = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
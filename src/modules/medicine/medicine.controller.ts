import { Request, Response } from "express";
import { medicineService, ServiceError } from "./medicine.service";
import paginationSortingHelpers from "../../helpers/paginationSortingHelpers";

// helper for consistent response
const send = (res: Response, code: number, message: string, data?: any) =>
    res.status(code).json({ message, data });

const sendError = (res: Response, err: any, fallback: string) => {
    const status = err instanceof ServiceError ? err.statusCode : 500;
    const message = err?.message || fallback;
    return res.status(status).json({ message });
};

// Public controllers
const getAllMedicines = async (req: Request, res: Response) => {
    try {
        const { search, category, manufacturer } = req.query;
        const searchString = typeof search === "string" ? search.trim() : undefined;
        const categoryString = typeof category === "string" ? category.trim() : undefined;
        const manufacturerString = typeof manufacturer === "string" ? manufacturer.trim() : undefined;
        const sellerId = typeof req.query.sellerId === "string" ? req.query.sellerId : undefined;

        const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
        const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;

        const inStock =
            typeof req.query.inStock === "string"
                ? req.query.inStock === "true"
                    ? true
                    : req.query.inStock === "false"
                        ? false
                        : undefined
                : undefined;

        const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelpers(req.query);

        if (minPrice !== undefined && Number.isNaN(minPrice)) {
            return send(res, 400, "Invalid minPrice");
        }
        if (maxPrice !== undefined && Number.isNaN(maxPrice)) {
            return send(res, 400, "Invalid maxPrice");
        }
        if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
            return send(res, 400, "minPrice cannot be greater than maxPrice");
        }

        const filters = {
            search: searchString,
            category: categoryString,
            manufacturer: manufacturerString,
            sellerId,
            minPrice,
            maxPrice,
            inStock,
            page,
            limit,
            skip,
            sortBy,
            sortOrder,
        };


        const data = await medicineService.getAllMedicines(filters);

        return send(res, 200, "Medicines fetched successfully", data);
    } catch (err) {
        console.error("getAllMedicines controller error:", err);
        return sendError(res, err, "Failed to fetch medicines");
    }
};


const getMedicineById = async (req: Request, res: Response) => {
    try {
        const medicine = await medicineService.getMedicineById(req.params.id as string);
        if (!medicine) return send(res, 404, "Medicine not found");
        return send(res, 200, "Medicine fetched successfully", medicine);
    } catch (err) {
        return sendError(res, err, "Failed to fetch medicine details");
    }
};

// Seller controllers
const addMedicine = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) return send(res, 401, "Unauthorized");
        const medicine = await medicineService.addMedicine(req.body, req.user.id);
        return send(res, 201, "Medicine created successfully", medicine);
    } catch (err) {
        return sendError(res, err, "Failed to add medicine");
    }
};

const updateMedicine = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) return send(res, 401, "Unauthorized");
        const medicine = await medicineService.updateMedicine(req.params.id as string, req.body, req.user.id);
        return send(res, 200, "Medicine updated successfully", medicine);
    } catch (err) {
        return sendError(res, err, "Failed to update medicine");
    }
};

const deleteMedicine = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) return send(res, 401, "Unauthorized");
        await medicineService.deleteMedicine(req.params.id as string, req.user.id);
        return send(res, 200, "Medicine deleted successfully");
    } catch (err) {
        return sendError(res, err, "Failed to delete medicine");
    }
};

const updateStock = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) return send(res, 401, "Unauthorized");
        const { stock } = req.body;
        const medicine = await medicineService.updateStock(req.params.id as string, stock, req.user.id);
        return send(res, 200, "Stock updated successfully", medicine);
    } catch (err) {
        return sendError(res, err, "Failed to update stock");
    }
};

export const medicineController = {
    getAllMedicines,
    getMedicineById,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    updateStock,
};
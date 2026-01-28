import { Request, Response } from "express";
import { medicineService, ServiceError } from "./medicine.service";

// helper for consistent response
const send = (res: Response, code: number, message: string, data?: any) =>
    res.status(code).json({ message, data });

const sendError = (res: Response, err: any, fallback: string) => {
    const status = err instanceof ServiceError ? err.statusCode : 500;
    const message = err?.message || fallback;
    return res.status(status).json({ message });
};

// Public controllers
const getAllMedicines = async (_req: Request, res: Response) => {
    try {
        const medicines = await medicineService.getAllMedicines();
        return send(res, 200, "Medicines fetched successfully", medicines);
    } catch (err) {
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
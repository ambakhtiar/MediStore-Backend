import { Request, Response } from "express";
import { AdminService } from "./admin.service";

const send = (res: Response, code: number, message: string, data?: any) =>
    res.status(code).json({ success: code >= 200 && code < 300, message, data });

const getStats = async (req: Request, res: Response) => {
    try {
        const result = await AdminService.getStats();
        return send(res, 200, "Admin stats retrieved successfully", result);
    } catch (err: any) {
        return send(res, 500, err?.message || "Failed to retrieve admin stats");
    }
};

export const AdminController = {
    getStats,
};

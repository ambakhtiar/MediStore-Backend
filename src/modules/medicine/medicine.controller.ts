import { Request, Response } from "express";
import { medicineService } from "./medicine.service";

const postMedicine = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        if (!data || !data.name) {
            res.status(400).json({ error: "Missing required field: name" });
            return;
        }

        const result = await medicineService.postMedicine(data);

        res.status(201).json({
            message: "Medicine created successfully",
            medicine: result,
        });
    } catch (err: any) {
        console.error("Error creating medicine:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getAllMedicines = async (req: Request, res: Response) => {
    try {
        const result = await medicineService.getAllMedicines();

        res.status(200).json({
            message: "Medicines retrieved successfully",
            medicine: result,
        });
    } catch (err: any) {
        console.error("Error getting medicines:", err);
        res.status(500).json({
            error: "Internal server error",
            message: err?.message,
        });
    }
};

export const medicineController = {
    postMedicine,
    getAllMedicines
};
import { Request, Response } from "express";
import { medicineService } from "./medicine.service";

// Controller
const postMedicine = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;
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

export const medicineController = {
    postMedicine,
};
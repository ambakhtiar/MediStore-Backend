import { Medicine } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

export class ServiceError extends Error {
    statusCode: number;
    constructor(message: string, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
    }
}


// Public services
const getAllMedicines = async () => {
    return prisma.medicine.findMany({ where: { isActive: true } });
};

const getMedicineById = async (id: string) => {
    return prisma.medicine.findUnique({ where: { id } });
};


// Seller services
const addMedicine = async (data: Medicine, sellerId: string) => {
    try {
        if (typeof data.price !== "number" || data.price < 0) throw new ServiceError("Invalid price", 400);

        const { name, genericName, description, price, stock, manufacturer, imageUrl, categoryId } = data;
        return await prisma.medicine.create({
            data: {
                name,
                genericName,
                description,
                price,
                stock,
                manufacturer,
                imageUrl,
                categoryId,
                sellerId,
            },
        });
    } catch (err) {
        throw new ServiceError("Database error while adding medicine", 500);
    }
};

const updateMedicine = async (id: string, data: Medicine, sellerId: string) => {
    const medicine = await prisma.medicine.findUnique({ where: { id } });
    if (!medicine) throw new ServiceError("Medicine not found", 404);
    if (medicine.sellerId !== sellerId) throw new ServiceError("Unauthorized", 403);

    const { name, genericName, description, price, stock, manufacturer, imageUrl, categoryId, isActive } = data;
    try {
        return await prisma.medicine.update({
            where: { id },
            data: {
                name,
                genericName,
                description,
                price,
                stock,
                manufacturer,
                imageUrl,
                categoryId,
                isActive
            },
        });
    } catch (err) {
        throw new ServiceError("Database error while updating medicine", 500);
    }
};

const deleteMedicine = async (id: string, sellerId: string) => {
    const medicine = await prisma.medicine.findUnique({ where: { id } });
    if (!medicine) throw new ServiceError("Medicine not found", 404);
    if (medicine.sellerId !== sellerId) throw new ServiceError("Unauthorized", 403);

    try {
        return await prisma.medicine.delete({ where: { id } });
    } catch (err) {
        throw new ServiceError("Database error while deleting medicine", 500);
    }
};

const updateStock = async (id: string, stock: number, sellerId: string) => {
    if (typeof stock !== "number" || stock < 0) {
        throw new ServiceError("Invalid stock value", 400);
    }

    const medicine = await prisma.medicine.findUnique({ where: { id } });
    if (!medicine) throw new ServiceError("Medicine not found", 404);
    if (medicine.sellerId !== sellerId) throw new ServiceError("Unauthorized", 403);

    try {
        return await prisma.medicine.update({
            where: { id },
            data: { stock },
        });
    } catch (err) {
        throw new ServiceError("Database error while updating stock", 500);
    }
};


export const medicineService = {
    getAllMedicines,
    getMedicineById,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    updateStock,
};
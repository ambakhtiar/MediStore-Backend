import { Medicine } from "../../generated/prisma/client";
import { MedicineWhereInput } from "../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

export class ServiceError extends Error {
    statusCode: number;
    constructor(message: string, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
    }
}


// Public services
type SearchFilters = {
    search?: string | undefined;
    category?: string | undefined;
    manufacturer?: string | undefined;
    sellerId?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    inStock?: boolean | undefined;
    page: number,
    limit: number,
    skip: number,
    sortBy: string,
    sortOrder: string,
};


const getAllMedicines = async (filters: SearchFilters) => {
    const { search, category, manufacturer, sellerId, minPrice, maxPrice, inStock, page = 1, limit = 20, skip, sortBy = "createdAt", sortOrder = "desc",
    } = filters;

    // build conditions
    const andConditions: MedicineWhereInput[] = [{ isActive: true }];

    if (search) {
        andConditions.push({
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                { genericName: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ],
        });
    }

    if (manufacturer) {
        andConditions.push({ manufacturer: { contains: manufacturer, mode: "insensitive" } });
    }

    if (sellerId) {
        andConditions.push({ sellerId });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        const price: any = {};
        if (minPrice !== undefined) price.gte = minPrice;
        if (maxPrice !== undefined) price.lte = maxPrice;
        andConditions.push({ price });
    }

    if (typeof inStock === "boolean") {
        andConditions.push(inStock ? { stock: { gt: 0 } } : { stock: { lte: 0 } });
    }

    if (category) {
        andConditions.push({
            OR: [
                { categoryId: category },
                { category: { name: { equals: category, mode: "insensitive" } } },
            ],
        });
    }

    try {
        const where = andConditions.length ? { AND: andConditions } : {};

        const [items, total] = await Promise.all([
            prisma.medicine.findMany({
                where,
                take: limit,
                skip,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    seller: true,
                    category: true
                }
            }),
            prisma.medicine.count({ where }),
        ]);

        return {
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            data: items,
        };
    } catch (err) {
        console.error("searchMedicines error:", err);
        throw new ServiceError("Database error while searching medicines", 500);
    }

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
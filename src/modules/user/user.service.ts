import { UserStatus } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

export class ServiceError extends Error {
    statusCode: number;
    constructor(message: string, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, ServiceError.prototype);
    }
}

// Get all users (customers + sellers)
type UserFilters = {
    search?: string | undefined;
    role?: string | undefined;
    status?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: string | undefined;
};

const getAllUsers = async (filters: UserFilters = {}) => {
    try {
        const { search, role, status, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = filters;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ];
        }
        if (role) where.role = role;
        if (status) where.status = status;

        const [items, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    image: true,
                    createdAt: true,
                }
            }),
            prisma.user.count({ where }),
        ]);

        return {
            items,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (err) {
        console.error("getAllUsers error:", err);
        throw new ServiceError("Database error while fetching users", 500);
    }
};

// Update user status (ban/unban)
const updateUserStatus = async (id: string, status: UserStatus) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) throw new ServiceError("User not found", 404);

        return await prisma.user.update({
            where: { id },
            data: { status },
        });
    } catch (err) {
        console.error("updateUserStatus error:", err);
        throw new ServiceError("Database error while updating user status", 500);
    }
};

export const userService = {
    getAllUsers,
    updateUserStatus,
};
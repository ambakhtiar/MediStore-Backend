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
const getAllUsers = async () => {
    try {
        return await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
        });
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
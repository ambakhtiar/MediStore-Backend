import { User } from "../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

export class ServiceError extends Error {
    statusCode: number;
    constructor(message: string, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, ServiceError.prototype);
    }
}

const getProfile = async (userId: string): Promise<User | null> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) throw new ServiceError("User not found", 404);
        return user;
    } catch (err) {
        console.error("getProfile error:", err);
        if (err instanceof ServiceError) throw err;
        throw new ServiceError("Database error while fetching profile", 500);
    }
};

const updateProfile = async (userId: string, data: Partial<User>): Promise<Partial<User>> => {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new ServiceError("User not found", 404);

        const { name, image, phone } = data;

        const updateData: Partial<User> = {};
        if (name !== undefined) updateData.name = name;
        if (image !== undefined) updateData.image = image;
        if (phone !== undefined) updateData.phone = phone;

        const result = await prisma.user.update({
            where: { id: userId },
            data: updateData as any,
        });

        return result;

    } catch (err: any) {
        console.error("updateProfile error:", err);
        if (err instanceof ServiceError) throw err;
        // map better-auth unique/email errors if needed
        throw new ServiceError("Failed to update profile", 500);
    }
};

type ChangePasswordOptions = {
    revokeOtherSessions?: boolean;
    headers?: Record<string, string>;
};

const changePassword = async (
    currentPassword: string,
    newPassword: string,
    options: ChangePasswordOptions = {}
): Promise<void> => {
    const { revokeOtherSessions = true, headers = {} } = options;

    try {
        // call better-auth change password endpoint
        const res = await auth.api.changePassword({
            body: {
                currentPassword,
                newPassword,
                revokeOtherSessions,
            },
            headers,
        });

        // handle client shapes that return an object with ok/status
        if (res && typeof res === "object") {
            if ("ok" in res && res.ok === false) {
                const msg = (res as any).message || "Failed to change password";
                const status = (res as any).status || 400;
                throw new ServiceError(msg, status);
            }
            if ("status" in res && (res as any).status >= 400) {
                const msg = (res as any).message || "Failed to change password";
                throw new ServiceError(msg, (res as any).status);
            }
        }

        return;
    } catch (err: any) {
        // rethrow ServiceError
        // TODO : CRETAE GlOBAL ERROR HANDLER 
        // TODO: REMOVE BELOW CODE 
        if (err instanceof ServiceError) throw err;

        const message = String(err?.message ?? "");

        if (err?.status === 401) {
            throw new ServiceError("Unauthorized. Please login and try again.", 401);
        }

        if (err?.status === 403 || /incorrect|invalid/i.test(message)) {
            throw new ServiceError("Current password is incorrect", 403);
        }

        if (/network|fetch|ECONNREFUSED|timeout/i.test(message)) {
            throw new ServiceError("Unable to reach authentication service. Try again later.", 503);
        }

        console.error("changePassword service error:", err);
        throw new ServiceError("Failed to change password", 500);
    }
};



export const profileService = {
    getProfile,
    updateProfile,
    changePassword,
};
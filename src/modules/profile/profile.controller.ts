import { Request, Response } from "express";
import { profileService, ServiceError } from "./profile.service";

const send = (res: Response, code: number, message: string, data?: any) =>
    res.status(code).json({ message, data });

const sendError = (res: Response, err: any, fallback: string) => {
    const status = err instanceof ServiceError ? err.statusCode : 500;
    const message = err?.message || fallback;
    return res.status(status).json({ message });
};

// GET /api/users/me
const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return send(res, 401, "Unauthorized");

        const user = await profileService.getProfile(userId);
        return send(res, 200, "Profile fetched successfully", user);
    } catch (err) {
        return sendError(res, err, "Failed to fetch profile");
    }
};


const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return send(res, 401, "Unauthorized");

        const updated = await profileService.updateProfile(userId, req.body);
        return send(res, 200, "Profile updated successfully", updated);
    } catch (err) {
        return sendError(res, err, "Failed to update profile");
    }
};

// Body: { currentPassword, newPassword }
const changePassword = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return send(res, 401, "Unauthorized");

        const { currentPassword, newPassword, revokeOtherSessions = true } = req.body ?? {};

        if (!currentPassword || !newPassword) {
            return send(res, 400, "Both currentPassword and newPassword are required");
        }

        if (typeof newPassword !== "string" || newPassword.length < 8) {
            return send(res, 400, "New password must be at least 8 characters");
        }

        if (newPassword === currentPassword) {
            return send(res, 400, "New password & current password do not same");
        }

        // pass cookies so better-auth can validate session
        const headers = { cookie: req.headers.cookie ?? "" };

        await profileService.changePassword(currentPassword, newPassword, {
            revokeOtherSessions,
            headers,
        });

        return send(res, 200, "Password changed successfully");
    } catch (err) {
        return sendError(res, err, "Failed to change password");
    }
};


export const profileController = {
    getProfile,
    updateProfile,
    changePassword,
};
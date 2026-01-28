import { Request, Response } from "express";
import { userService, ServiceError } from "./user.service";
import { UserStatus } from "../../generated/prisma/enums";

const send = (res: Response, code: number, message: string, data?: any) =>
    res.status(code).json({ message, data });

const sendError = (res: Response, err: any, fallback: string) => {
    const status = err instanceof ServiceError ? err.statusCode : 500;
    const message = err?.message || fallback;
    return res.status(status).json({ message });
};


const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await userService.getAllUsers();
        return send(res, 200, "Users fetched successfully", users);
    } catch (err) {
        return sendError(res, err, "Failed to fetch users");
    }
};

// Ban/Unban user
const updateUserStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (status !== UserStatus.BAN && status !== UserStatus.UNBAN) {
            return res.status(400).json({ message: "Invalid status" });
        }

        await userService.updateUserStatus(id as string, status as UserStatus);

        const updatedUser = await userService.updateUserStatus(id as string, status);
        return send(res, 200, "User status updated successfully", updatedUser);
    } catch (err) {
        return sendError(res, err, "Failed to update user status");
    }
};

export const userController = {
    getAllUsers,
    updateUserStatus,
};
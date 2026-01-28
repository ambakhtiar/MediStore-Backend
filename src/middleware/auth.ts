import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from "../lib/auth";
import { UserRole } from "../types";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                role: string;
            }
        }
    }
}

const auth = (...rules: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // get  user session 
        const session = await betterAuth.api.getSession({
            headers: req.headers as any
        })
        // console.log(session);

        if (!session) {
            return res.status(403).json({
                success: false,
                message: "You are not authorizes!"
            })
        }

        req.user = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: session.user.role as string,
        }

        if (rules.length && !rules.includes(req.user.role as UserRole)) {
            console.log(rules, req.user);
            return res.status(403).json({
                success: false,
                message: "Forbidden! Access Denied!"
            })
        }

        next();
    }
}

export default auth;
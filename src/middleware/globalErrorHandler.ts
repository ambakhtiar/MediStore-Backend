import { NextFunction, Request, Response } from "express";
import logger from "../lib/logger";
import { Prisma } from "../generated/prisma/client";
import { ServiceError } from "../lib/error";

const isDev = process.env.NODE_ENV !== "production";

function mapPrismaError(err: any) {
    let status = 500;
    let message = "Database error";
    if (err instanceof Prisma.PrismaClientValidationError) {
        status = 400; message = "Invalid input";
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2002": status = 409; message = "Duplicate entry"; break;
            case "P2025": status = 404; message = "Record not found"; break;
            case "P2003": status = 400; message = "Foreign key constraint failed"; break;
            default: status = 400; message = "Database request error";
        }
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
        status = 503; message = "Database initialization error";
    } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        status = 500; message = "Database unknown error";
    } else if (err instanceof Prisma.PrismaClientRustPanicError) {
        status = 500; message = "Database internal error";
    }
    return { status, message };
}

export default function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    let statusCode = 500;
    let clientMessage = "Internal Server Error";

    if (err instanceof ServiceError) {
        statusCode = err.statusCode || 400;
        clientMessage = err.message || clientMessage;
    } else if (
        err instanceof Prisma.PrismaClientKnownRequestError ||
        err instanceof Prisma.PrismaClientValidationError ||
        err instanceof Prisma.PrismaClientInitializationError ||
        err instanceof Prisma.PrismaClientUnknownRequestError ||
        err instanceof Prisma.PrismaClientRustPanicError
    ) {
        const mapped = mapPrismaError(err);
        statusCode = mapped.status;
        clientMessage = mapped.message;
    } else if (err && typeof err.status === "number" && typeof err.message === "string") {
        statusCode = err.status;
        clientMessage = err.message;
    } else {
        clientMessage = "Internal Server Error";
    }

    // Log full details server-side (stack, prisma meta) — do not expose to clients in production
    try {
        logger.error({
            message: err?.message ?? String(err),
            path: req.path,
            method: req.method,
            user: (req as any).user?.id ?? null,
            statusCode,
            // include full error only in dev logs
            error: isDev ? err : undefined,
        });
    } catch (logErr) {
        console.error("Logger failed:", logErr);
        console.error(err);
    }

    const body: any = { message: clientMessage };
    if (isDev) body.error = { stack: err?.stack, details: err?.details ?? undefined };
    res.status(statusCode).json(body);
}
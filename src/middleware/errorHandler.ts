import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import multer from "multer";

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            ...(err instanceof AppError &&
                "errors" in err && { errors: (err as any).errors }),
        });
    }

    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ error: "File too large" });
        }
        return res.status(400).json({ error: err.message });
    }

    if (err.message?.includes("Invalid file type")) {
        return res.status(400).json({ error: err.message });
    }

    console.error("Unhandled error:", err);

    const isDev = process.env.NODE_ENV === "development";

    res.status(500).json({
        error: isDev ? err.message : "Internal server error",
    });
}

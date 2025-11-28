import { Request, Response, NextFunction } from "express";
import { getUserIdByApiKey } from "../utils/fs";
import { isValidApiKey } from "../utils/validation";

export interface AuthenticatedRequest extends Request {
    userId?: string;
    apiKey?: string;
}

export async function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Missing Authorization header" });
    }

    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Invalid Authorization format. Use: Bearer <apiKey>",
        });
    }

    const apiKey = authHeader.slice(7);

    if (!isValidApiKey(apiKey)) {
        return res.status(401).json({ error: "Invalid API key format" });
    }

    const userId = await getUserIdByApiKey(apiKey);

    if (!userId) {
        return res.status(401).json({ error: "Invalid API key" });
    }

    req.userId = userId;
    req.apiKey = apiKey;

    next();
}

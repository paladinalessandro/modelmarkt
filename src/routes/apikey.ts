import { Router } from "express";
import crypto from "crypto";
import { readApiKeys, writeApiKeys } from "../utils/fs";
import { NotFoundError, ValidationError, ConflictError } from "../utils/errors";

const router = Router();

function generateApiKey(): string {
    return crypto.randomBytes(32).toString("hex");
}

router.post("/create", async (req, res, next) => {
    try {
        const { stackauthUserId } = req.body;

        if (!stackauthUserId) {
            throw new ValidationError("stackauthUserId is required");
        }

        const apiKeys = await readApiKeys();

        if (apiKeys[stackauthUserId]) {
            throw new ConflictError("API key already exists for this user");
        }

        const apiKey = generateApiKey();
        apiKeys[stackauthUserId] = apiKey;
        await writeApiKeys(apiKeys);

        res.status(201).json({ apiKey });
    } catch (error) {
        next(error);
    }
});

router.post("/regenerate", async (req, res, next) => {
    try {
        const { stackauthUserId } = req.body;

        if (!stackauthUserId) {
            throw new ValidationError("stackauthUserId is required");
        }

        const apiKeys = await readApiKeys();
        const apiKey = generateApiKey();
        apiKeys[stackauthUserId] = apiKey;
        await writeApiKeys(apiKeys);

        res.json({ apiKey });
    } catch (error) {
        next(error);
    }
});

router.get("/get", async (req, res, next) => {
    try {
        const { userId } = req.query;

        if (!userId || typeof userId !== "string") {
            throw new ValidationError("userId query param is required");
        }

        const apiKeys = await readApiKeys();
        const apiKey = apiKeys[userId];

        if (!apiKey) {
            throw new NotFoundError("API key");
        }

        res.json({ apiKey });
    } catch (error) {
        next(error);
    }
});

router.delete("/revoke", async (req, res, next) => {
    try {
        const { stackauthUserId } = req.body;

        if (!stackauthUserId) {
            throw new ValidationError("stackauthUserId is required");
        }

        const apiKeys = await readApiKeys();

        if (!apiKeys[stackauthUserId]) {
            throw new NotFoundError("API key");
        }

        delete apiKeys[stackauthUserId];
        await writeApiKeys(apiKeys);

        res.json({ message: "API key revoked" });
    } catch (error) {
        next(error);
    }
});

export default router;

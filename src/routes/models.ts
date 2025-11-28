import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import {
    readModelsFile,
    getModelById,
    incrementModelCallCount,
    getModelFilePath,
    deleteModel,
    updateModel,
} from "../utils/fs";
import { isValidModelId } from "../utils/validation";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";
import { runInference } from "../utils/inference";
import {
    NotFoundError,
    ValidationError,
    ForbiddenError,
} from "../utils/errors";

const router = Router();

const imageUpload = multer({
    dest: "temp/",
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = [".jpg", ".jpeg", ".png", ".webp"];
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, allowed.includes(ext));
    },
});

router.get("/", async (req, res, next) => {
    try {
        const { models } = await readModelsFile();

        const search = req.query.search as string | undefined;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        let filtered = models;

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = models.filter(
                (m) =>
                    m.name.toLowerCase().includes(searchLower) ||
                    m.description.toLowerCase().includes(searchLower),
            );
        }

        const total = filtered.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const paginated = filtered.slice(startIndex, startIndex + limit);

        res.json({
            models: paginated,
            pagination: { page, limit, total, totalPages },
        });
    } catch (error) {
        next(error);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidModelId(id)) {
            throw new ValidationError("Invalid model ID format");
        }

        const model = await getModelById(id);
        if (!model) {
            throw new NotFoundError("Model");
        }

        res.json({ model });
    } catch (error) {
        next(error);
    }
});

router.post(
    "/:id",
    authMiddleware,
    imageUpload.single("image"),
    async (req: AuthenticatedRequest, res, next) => {
        let tempFilePath: string | null = null;

        try {
            const { id } = req.params;

            const model = await getModelById(id);
            if (!model) {
                throw new NotFoundError("Model");
            }

            if (!req.file) {
                throw new ValidationError("Image file required");
            }

            tempFilePath = req.file.path;
            const modelFilePath = getModelFilePath(model.filename);
            const result = await runInference(modelFilePath, tempFilePath);

            await incrementModelCallCount(id);

            res.json({ model: model.name, result });
        } catch (error) {
            next(error);
        } finally {
            if (tempFilePath) {
                await fs.unlink(tempFilePath).catch(() => {});
            }
        }
    },
);

router.patch(
    "/:id",
    authMiddleware,
    async (req: AuthenticatedRequest, res, next) => {
        try {
            const { id } = req.params;
            const { name, description } = req.body;

            const model = await getModelById(id);
            if (!model) {
                throw new NotFoundError("Model");
            }

            if (model.userId && model.userId !== req.userId) {
                throw new ForbiddenError("You can only edit your own models");
            }

            const updates: { name?: string; description?: string } = {};
            if (name) updates.name = name.trim();
            if (description !== undefined)
                updates.description = description.trim();

            const updated = await updateModel(id, updates);

            res.json({ model: updated });
        } catch (error) {
            next(error);
        }
    },
);

router.delete(
    "/:id",
    authMiddleware,
    async (req: AuthenticatedRequest, res, next) => {
        try {
            const { id } = req.params;

            const model = await getModelById(id);
            if (!model) {
                throw new NotFoundError("Model");
            }

            if (model.userId && model.userId !== req.userId) {
                throw new ForbiddenError("You can only delete your own models");
            }

            await deleteModel(id);

            res.json({ message: "Model deleted" });
        } catch (error) {
            next(error);
        }
    },
);

export default router;

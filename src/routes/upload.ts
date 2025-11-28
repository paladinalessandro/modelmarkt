import { Router, Request } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { addModel } from "../utils/fs";
import {
    isAllowedModelExtension,
    validateModelMetadata,
} from "../utils/validation";
import { Model } from "../types";

const router = Router();

const storage = multer.diskStorage({
    destination: "./models",
    filename: (req, file, cb) => {
        const id = uuidv4();
        const ext = path.extname(file.originalname);
        (req as any).generatedModelId = id;
        cb(null, `${id}${ext}`);
    },
});

const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
) => {
    if (isAllowedModelExtension(file.originalname)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Allowed: .keras, .h5, .pt, .onnx"));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 1024,
    },
});

router.post("/", upload.single("model"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { name, description, inputType, userId } = req.body;

        const validationErrors = validateModelMetadata({
            name,
            description,
            inputType,
        });
        if (validationErrors.length > 0) {
            return res.status(400).json({ errors: validationErrors });
        }

        const modelId = (req as any).generatedModelId;

        const model: Model = {
            id: modelId,
            name: name.trim(),
            description: description?.trim() || "",
            filename: req.file.filename,
            inputType: inputType || "image",
            createdAt: new Date().toISOString(),
            userId: userId || null,
            callCount: 0,
        };

        await addModel(model);

        res.status(201).json({
            message: "Model uploaded successfully",
            model,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Upload failed" });
    }
});

export default router;

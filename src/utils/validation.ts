import { Model } from "../types";

export function isValidModelId(id: string): boolean {
    return /^[a-zA-Z0-9-]+$/.test(id);
}

export function isValidApiKey(key: string): boolean {
    return typeof key === "string" && /^[a-f0-9]{64}$/.test(key);
}

export const ALLOWED_MODEL_EXTENSIONS = [".keras", ".h5", ".pt", ".onnx"];

export function isAllowedModelExtension(filename: string): boolean {
    const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
    return ALLOWED_MODEL_EXTENSIONS.includes(ext);
}

export function validateModelMetadata(data: Partial<Model>): string[] {
    const errors: string[] = [];

    if (
        !data.name ||
        typeof data.name !== "string" ||
        data.name.trim() === ""
    ) {
        errors.push("Model name is required");
    }

    if (data.name && data.name.length > 100) {
        errors.push("Model name must be 100 characters or less");
    }

    if (data.description && data.description.length > 1000) {
        errors.push("Description must be 1000 characters or less");
    }

    if (data.inputType && !["image", "text", "json"].includes(data.inputType)) {
        errors.push("inputType must be one of: image, text, json");
    }

    return errors;
}

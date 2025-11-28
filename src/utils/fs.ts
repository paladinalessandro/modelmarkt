import fs from "fs/promises";
import path from "path";
import { Model, ModelsFile } from "../types";

const MODELS_DIR = path.join(__dirname, "../../models");
const MODELS_FILE = path.join(MODELS_DIR, "models.json");
const APIKEYS_FILE = path.join(__dirname, "../../apikeys.json");

export async function readModelsFile(): Promise<ModelsFile> {
    try {
        const data = await fs.readFile(MODELS_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error: any) {
        // If file doesn't exist, return empty structure
        if (error.code === "ENOENT") {
            return { models: [] };
        }
        throw error;
    }
}

export async function writeModelsFile(data: ModelsFile): Promise<void> {
    await fs.writeFile(MODELS_FILE, JSON.stringify(data, null, 2));
}

export async function getModelById(id: string): Promise<Model | null> {
    const { models } = await readModelsFile();
    return models.find((model) => model.id === id) || null;
}

export async function addModel(model: Model): Promise<Model> {
    const data = await readModelsFile();
    data.models.push(model);
    await writeModelsFile(data);
    return model;
}

export async function updateModel(
    id: string,
    updates: Partial<Omit<Model, "id">>,
): Promise<Model | null> {
    const data = await readModelsFile();
    const index = data.models.findIndex((model) => model.id === id);

    if (index === -1) {
        return null;
    }

    data.models[index] = { ...data.models[index], ...updates };
    await writeModelsFile(data);
    return data.models[index];
}

export async function deleteModel(id: string): Promise<boolean> {
    const data = await readModelsFile();
    const modelIndex = data.models.findIndex((model) => model.id === id);

    if (modelIndex === -1) {
        return false;
    }

    const model = data.models[modelIndex];

    data.models.splice(modelIndex, 1);
    await writeModelsFile(data);

    try {
        const modelFilePath = path.join(MODELS_DIR, model.filename);
        await fs.unlink(modelFilePath);
    } catch {
        // File might not exist, that's okay
    }

    try {
        const metadataFilePath = path.join(MODELS_DIR, `${id}.json`);
        await fs.unlink(metadataFilePath);
    } catch {
        // Metadata file might not exist, that's okay
    }

    return true;
}

export async function incrementModelCallCount(id: string): Promise<void> {
    const data = await readModelsFile();
    const model = data.models.find((m) => m.id === id);

    if (model) {
        model.callCount = (model.callCount || 0) + 1;
        await writeModelsFile(data);
    }
}

export async function readApiKeys(): Promise<Record<string, string>> {
    try {
        const data = await fs.readFile(APIKEYS_FILE, "utf-8");
        return JSON.parse(data);
    } catch {
        return {};
    }
}

export async function writeApiKeys(
    data: Record<string, string>,
): Promise<void> {
    await fs.writeFile(APIKEYS_FILE, JSON.stringify(data, null, 2));
}

export async function getUserIdByApiKey(
    apiKey: string,
): Promise<string | null> {
    const apiKeys = await readApiKeys();

    for (const [userId, key] of Object.entries(apiKeys)) {
        if (key === apiKey) {
            return userId;
        }
    }

    return null;
}

export async function isApiKeyValid(apiKey: string): Promise<boolean> {
    const userId = await getUserIdByApiKey(apiKey);
    return userId !== null;
}

export async function modelFileExists(filename: string): Promise<boolean> {
    try {
        await fs.access(path.join(MODELS_DIR, filename));
        return true;
    } catch {
        return false;
    }
}

export function getModelFilePath(filename: string): string {
    return path.join(MODELS_DIR, filename);
}

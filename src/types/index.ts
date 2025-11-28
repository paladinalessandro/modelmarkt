export interface Model {
    id: string;
    name: string;
    description: string;
    filename: string;
    inputType: "image" | "text" | "json";
    createdAt: string;
    userId: string | null;
    callCount: number;
}

export interface ModelsFile {
    models: Model[];
}

export interface ApiKeysFile {
    [userId: string]: string;
}

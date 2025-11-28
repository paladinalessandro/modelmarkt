import { spawn } from "child_process";
import path from "path";

export interface InferenceResult {
    success?: boolean;
    predictions?: number[][];
    predicted_class?: number;
    confidence?: number;
    error?: string;
}

export function runInference(
    modelPath: string,
    imagePath: string,
    timeoutMs: number = 30000,
): Promise<InferenceResult> {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, "../inference/run.py");
        const process = spawn("python3", [scriptPath, modelPath, imagePath]);

        let stdout = "";
        let stderr = "";

        const timeout = setTimeout(() => {
            process.kill();
            reject(new Error("Inference timeout"));
        }, timeoutMs);

        process.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        process.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        process.on("close", (code) => {
            clearTimeout(timeout);
            try {
                const result = JSON.parse(stdout);
                resolve(result);
            } catch {
                reject(new Error(stderr || "Failed to parse inference result"));
            }
        });
    });
}

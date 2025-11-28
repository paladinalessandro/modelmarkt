import express from "express";
import cors from "cors";
import modelsRouter from "./routes/models";
import uploadRouter from "./routes/upload";
import apikeyRouter from "./routes/apikey";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use("/models", modelsRouter);
app.use("/upload", uploadRouter);
app.use("/apikey", apikeyRouter);

app.get("/", (req, res) => {
    res.json({ status: "ok", message: "ModelMarkt API is running" });
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});

import express, { urlencoded } from "express";
import Redis from "ioredis";
import cors from "cors"
import { ApiError } from "./utils/apiError.js";

const app = express();
export const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");


const errorHandler = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal Server Error";
        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }

    const response = {
        success: error.success,
        message: error.message,
        errors: error.errors,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
    };

    return res.status(error.statusCode).json(response);
};

app.use(express.json({ limit: "10mb" }));
app.use(urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public"));
app.use(cors(
  {origin: "*"}
))


import authRouter from "./routes/auth.route.js";
import aiRouter from "./routes/ai.route.js";

app.use("/api/v1/auth", authRouter);
app.use("/ai", aiRouter);


app.use(errorHandler);

export { app };
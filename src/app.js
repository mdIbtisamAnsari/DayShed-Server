import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ApiError } from "./utils/apiError.js";

const app = express();


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

app.use(cors({
  origin: "*",  // to change later !!!!!!!!!!!!!!
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(urlencoded({ extended: true, limit: "10mb" }))
app.use(express.static("public"))
app.use(cookieParser())
app.use(errorHandler)

// import Routes

export {app}
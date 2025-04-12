import express from "express";
import cookieParser from "cookie-parser";
import error from './utils/error.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//router imports
import healthCheckRouter from "./routes/healthcheck.routes.js"
import authRouter from "./routes/auth.routes.js"

app.use("/api/v1/healthcheck", healthCheckRouter)
app.use("/api/v1/auth", authRouter)
app.use(error);

export default app;

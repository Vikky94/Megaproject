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
import projectRouter from "./routes/project.routes.js"
import taskRouter from "./routes/task.routes.js"
import notesRouter from "./routes/note.routes.js"

app.use("/api/v1/healthcheck", healthCheckRouter)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/projects", projectRouter)
app.use("/api/v1/tasks", taskRouter)
app.use("/api/v1/notes", notesRouter)

app.use(error);

export default app;

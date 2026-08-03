import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js"

const app = express();

app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use("/api/v1/auth", authRoutes)

app.get("/health", (_, res) => {
  res.json({
    success: true,
    message: "LedgerFlow API is running",
  });
});
app.use(errorHandler);

export default app;
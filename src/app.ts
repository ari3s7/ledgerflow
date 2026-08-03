import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({
    success: true,
    message: "LedgerFlow API is running",
  });
});
app.use(errorHandler);

export default app;
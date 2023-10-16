import express, { NextFunction, Request, Response } from "express";
import "dotenv/config";

export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import userRoutes from "./routes/user.routes";
import courseRoutes from "./routes/course.routes";
import orderRouter from "./routes/order.routes";

app.use(express.json({ limit: "50mb" }));

app.use(cookieParser());

app.use(cors({ origin: process.env.ORIGIN }));

app.use("/api/v1", userRoutes);
app.use("/api/v1", courseRoutes);
app.use("/api/v1", orderRouter);

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "API is Up Baby",
  });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);

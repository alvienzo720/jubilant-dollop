import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import Errorhandler from "../utils/ErrorHandling";
import Jwt, { JwtPayload } from "jsonwebtoken";
import "dotenv/config";
import { redis } from "../utils/redis";

export const isAuthenticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token;

    if (!access_token) {
      return next(new Errorhandler("Please login to access this service", 400));
    }
    const decoded = Jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN as string
    ) as JwtPayload;
    if (!decoded) {
      return next(new Errorhandler("access token not valid", 400));
    }
    const user = await redis.get(decoded.id as string);

    if (!user) {
      return next(new Errorhandler("User not found", 400));
    }
    req.user = JSON.parse(user);
  }
);

import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import Errorhandler from "../utils/ErrorHandling";
import { generateLast12MonthData } from "../utils/analytics.generator";
import userModel from "../models/user.model";

//get user analytics
export const getUserAnalytics = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await generateLast12MonthData(userModel);
      res.status(200).json({ success: true, users });
    } catch (error: any) {
      return next(new Errorhandler(error.messsage, 500));
    }
  }
);

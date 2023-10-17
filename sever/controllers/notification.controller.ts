import { Response, Request, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import NotificationModel from "../models/notificationModel";
import Errorhandler from "../utils/ErrorHandling";

export const getNotification = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notifications = await NotificationModel.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        sucess: true,
        notifications,
      });
    } catch (error: any) {
      return next(new Errorhandler(error.message, 500));
    }
  }
);

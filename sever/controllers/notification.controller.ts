import { Response, Request, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import NotificationModel from "../models/notificationModel";
import Errorhandler from "../utils/ErrorHandling";
import cron from "node-cron";

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

//upadte notificatrion status

export const updateNotification = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notifcation = await NotificationModel.findById(req.params.id);
      if (!notifcation) {
        return next(new Errorhandler("Notification not found", 404));
      } else {
        notifcation?.status
          ? (notifcation.status = "read")
          : notifcation.status;
      }
      await notifcation.save();

      const notifcations = await NotificationModel.find().sort({
        createdAt: -1,
      });

      res.status(201).json({
        success: true,
        notifcation,
      });
    } catch (error: any) {
      return next(new Errorhandler(error.message, 500));
    }
  }
);

cron.schedule("0 0 0 * * *", async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await NotificationModel.deleteMany({
    status: "read",
    createdAt: { $lt: thirtyDaysAgo },
  });
  console.log("Deleted read notification");
});

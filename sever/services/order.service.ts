//create new order service

import { NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import OrderModel from "../models/order.model";

export const newOrder = CatchAsyncError(
  async (data: any, next: NextFunction) => {
    const order = await OrderModel.create(data);
  }
);

//create new order service

import { Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import OrderModel from "../models/order.model";

export const newOrder = CatchAsyncError(async (data: any, res: Response) => {
  const order = await OrderModel.create(data);
  res.status(201).json({ sucess: true, order });
});

// Get all orders service
export const getAllOrdersService = async (res: Response) => {
  const courses = await OrderModel.find().sort({ createdAt: -1 });
  res.status(201).json({ sucess: true, courses });
};

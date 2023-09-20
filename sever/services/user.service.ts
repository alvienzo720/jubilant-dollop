import { Response } from "express";
import userModel from "../models/user.model";

export const getUserByID = async (id: any, res: Response) => {
  const user = await userModel.findById(id);
  res.status(201).json({ success: true, user });
};

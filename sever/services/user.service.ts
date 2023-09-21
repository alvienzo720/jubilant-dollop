import { Response } from "express";
import { redis } from "../utils/redis";

export const getUserByID = async (id: any, res: Response) => {
  const userJson = await redis.get(id);
  if (userJson) {
    const user = JSON.parse(userJson);
    res.status(201).json({ success: true, user });
  }
};

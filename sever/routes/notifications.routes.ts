import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { getNotification } from "../controllers/notification.controller";

const notificationRoute = express.Router();

notificationRoute.get(
  "/get-all-notifcations",
  isAuthenticated,
  getNotification
);

export default notificationRoute

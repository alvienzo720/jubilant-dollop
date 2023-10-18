import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {
  getNotification,
  updateNotification,
} from "../controllers/notification.controller";

const notificationRoute = express.Router();

notificationRoute.get(
  "/get-all-notifcations",
  isAuthenticated,
  getNotification
);
notificationRoute.put(
  "/update-notification/:id",
  isAuthenticated,
  updateNotification
);

export default notificationRoute;

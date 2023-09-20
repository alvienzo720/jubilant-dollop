import express from "express";
import {
  activateUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/auth";

const userRoutes = express.Router();
userRoutes.post("/registration", registerUser);

userRoutes.post("/activate-user", activateUser);
userRoutes.post("/login-user", loginUser);
userRoutes.get("/logout-user",isAuthenticated ,logoutUser);
export default userRoutes;

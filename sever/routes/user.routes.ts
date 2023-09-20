import express from "express";
import {
  activateUser,
  getUserInfo,
  loginUser,
  logoutUser,
  registerUser,
  socialAuth,
  updateAccessToken,
} from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const userRoutes = express.Router();
userRoutes.post("/registration", registerUser);

userRoutes.post("/activate-user", activateUser);
userRoutes.post("/login", loginUser);
userRoutes.get("/logout", isAuthenticated, authorizeRoles("admin"), logoutUser);
userRoutes.get("/refreshtoken", updateAccessToken);
userRoutes.get("/me", isAuthenticated, getUserInfo);
userRoutes.post("/social-auth", socialAuth);
export default userRoutes;

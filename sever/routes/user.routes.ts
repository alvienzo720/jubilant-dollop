import express from "express";
import {
  activateUser,
  getUserInfo,
  loginUser,
  logoutUser,
  registerUser,
  socialAuth,
  updateAccessToken,
  updatePassword,
  updateProfilePicture,
  updateUserInfo,
} from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const userRoutes = express.Router();
userRoutes.post("/registration", registerUser);

userRoutes.post("/activate-user", activateUser);
userRoutes.post("/login", loginUser);
userRoutes.get("/logout", isAuthenticated, authorizeRoles("user"), logoutUser);
userRoutes.get("/refreshtoken", updateAccessToken);
userRoutes.get("/me", isAuthenticated, getUserInfo);
userRoutes.post("/social-auth", socialAuth);
userRoutes.put("/update-user-info", isAuthenticated, updateUserInfo);
userRoutes.put("/update-user-password", isAuthenticated, updatePassword);
userRoutes.put("/update-user-avatar", isAuthenticated, updateProfilePicture); 
export default userRoutes;

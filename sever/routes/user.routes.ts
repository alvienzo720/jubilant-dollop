import express from "express";
import {
  activateUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const userRoutes = express.Router();
userRoutes.post("/registration", registerUser);

userRoutes.post("/activate-user", activateUser);
userRoutes.post("/login", loginUser);
userRoutes.get("/logout", isAuthenticated,authorizeRoles("admin"), logoutUser);
export default userRoutes;

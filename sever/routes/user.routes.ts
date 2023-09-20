import express from "express";
import { activateUser, loginUser, registerUser } from "../controllers/user.controller";

const userRoutes = express.Router();
userRoutes.post("/registration", registerUser);

userRoutes.post("/activate-user", activateUser);
userRoutes.post("/login-user", loginUser);
export default userRoutes;

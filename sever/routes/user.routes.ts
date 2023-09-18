import express from "express";
import { activateUser, registerUser } from "../controllers/user.controller";

const userRoutes = express.Router();
userRoutes.post("/registration", registerUser);

userRoutes.post("/activate-user", activateUser);
export default userRoutes;

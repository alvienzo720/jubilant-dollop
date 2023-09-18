import express from "express";
import { registerUser } from "../controllers/user.controller";

const userRoutes = express.Router();
userRoutes.post("/registration", registerUser);

export default userRoutes;

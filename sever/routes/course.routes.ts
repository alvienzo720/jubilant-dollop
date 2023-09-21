import express from "express";
import { uploadCourse } from "../controllers/course.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const courseRoutes = express.Router();

courseRoutes.post(
  "/create-course",
  isAuthenticated,
  authorizeRoles("user"),
  uploadCourse
);

export default courseRoutes;

import express from "express";
import { editCourse, uploadCourse } from "../controllers/course.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const courseRoutes = express.Router();

courseRoutes.post(
  "/create-course",
  isAuthenticated,
  authorizeRoles("user"),
  uploadCourse
);
courseRoutes.put(
  "/edit-course/:id",
  isAuthenticated,
  authorizeRoles("user"),
  editCourse
);

export default courseRoutes;

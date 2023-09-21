import express from "express";
import {
  editCourse,
  getSingleCourse,
  uploadCourse,
} from "../controllers/course.controller";
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

courseRoutes.get("/get-course/:id", getSingleCourse);

export default courseRoutes;
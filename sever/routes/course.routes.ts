import express from "express";
import {
  addQuestion,
  editCourse,
  getAllCOurses,
  getCourseByUser,
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

courseRoutes.get("/get-all-courses", getAllCOurses);

courseRoutes.get("/get-course-content/:id", isAuthenticated, getCourseByUser);

courseRoutes.put("/add-question", isAuthenticated, addQuestion);

export default courseRoutes;

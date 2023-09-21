import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import cloudinary from "cloudinary";
import { createCourse } from "../services/course.service";
import Errorhandler from "../utils/ErrorHandling";
import CourseModel from "../models/course.model";

//create course or upload course
export const uploadCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail.url, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      createCourse(data, res, next);
    } catch (error: any) {
      return next(new Errorhandler(error.message, 400));
    }
  }
);

//edit course
export const editCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        await cloudinary.v2.uploader.destroy(thumbnail.public_url);
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail.url, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: myCloud.public_url,
          url: myCloud.secure_url,
        };
      }
      const courseId = req.params.id;
      const course = await CourseModel.findByIdAndUpdate(
        courseId,
        {
          $set: data,
        },
        { new: true }
      );
      res.status(201).json({ success: true, course });
    } catch (erro: any) {
      console.log("Error found", erro);
      return next(new Errorhandler(erro.message, 500));
    }
  }
);

//get singile course without purchasing
export const getSingleCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const course = await CourseModel.findById(req.params.id).select(
        "-courseData.videoUrl -courseData.suggestions -courseData.questions -courseData.links"
      );
      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new Errorhandler(error.message, 500));
    }
  }
);

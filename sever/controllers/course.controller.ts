import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import cloudinary from "cloudinary";
import { createCourse, getAllCoursesService } from "../services/course.service";
import Errorhandler from "../utils/ErrorHandling";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notificationModel";

interface IAddQuestionData {
  question: string;
  courseId: string;
  contentId: string;
}

interface IAddAnswerData {
  answer: string;
  courseId: string;
  contentId: string;
  questionId: string;
}

interface IAddReviewData {
  review: string;
  courseId: string;
  rating: number;
  userId: string;
}

interface IAddReviewAnswer {
  comment: string;
  courseId: string;
  reviewId: string;
}

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
      const courseId = req.params.id;
      //check if course is in redis
      const isCachedExisit = await redis.get(courseId);
      if (isCachedExisit) {
        const course = JSON.parse(isCachedExisit);
        res.status(200).json({ sucess: true, course });
      } else {
        //fetch course from mongo db
        const course = await CourseModel.findById(req.params.id).select(
          "-courseData.videoUrl -courseData.suggestions -courseData.questions -courseData.links"
        );
        //save course to redis now
        await redis.set(courseId, JSON.stringify(course));
        res.status(201).json({
          success: true,
          course,
        });
      }
    } catch (error: any) {
      return next(new Errorhandler(error.message, 500));
    }
  }
);

//get all courses aunthenticated
export const getAllCOurses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isCachedExisit = await redis.get("allCourses");
      if (isCachedExisit) {
        const courses = JSON.parse(isCachedExisit);
        res.status(200).json({ sucess: true, courses });
      } else {
        const courses = await CourseModel.find().select(
          "-courseData.videoUrl -courseData.suggestions -courseData.questions -courseData.links"
        );
        await redis.set("allCourses", JSON.stringify(courses));
        res.status(201).json({ sucess: true, courses });
      }
    } catch (error: any) {
      return next(new Errorhandler(error.message, 500));
    }
  }
);

//get course content for valid users only
export const getCourseByUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;

      const courseId = req.params.id;
      const courseExisits = userCourseList?.find(
        (course: any) => course._id.toString() === courseId.toString()
      );
      if (!courseExisits) {
        return next(
          new Errorhandler("You are not enrolled in this course", 403)
        );
      }
      const course = await CourseModel.findById(courseId);
      res.status(200).json({ success: true, course });
    } catch (error: any) {
      console.log("error", error);
      return next(new Errorhandler(error.message, 500));
    }
  }
);

//Add Question
export const addQuestion = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, courseId, contentId }: IAddQuestionData = req.body;
      const course = await CourseModel.findById(courseId);
      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new Errorhandler("Invalid content id", 400));
      }
      const courseContent = course?.courseData.find((item) =>
        item._id.equals(contentId)
      );

      if (!courseContent) {
        return next(new Errorhandler("Invalid course content id", 400));
      }

      //creating a new question
      const newQuestion: any = {
        user: req.user,
        question,
        questionReplies: [],
      };

      //add this question to iur course conetent

      courseContent.questions.push(newQuestion);

      await NotificationModel.create({
        user: req.user?._id,
        title: "New Question Recived",
        message: `You have a new question in ${courseContent.title}`,
      });

      await course?.save();
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new Errorhandler(error.message, 500));
    }
  }
);

//and answer in course question
export const addAnswer = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, courseId, contentId, questionId }: IAddAnswerData =
        req.body;
      const course = await CourseModel.findById(courseId);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new Errorhandler("Invalid content id", 400));
      }
      const courseContent = course?.courseData.find((item) =>
        item._id.equals(contentId)
      );
      if (!courseContent) {
        return next(new Errorhandler("Invalid course content id", 400));
      }
      const question = courseContent.questions.find((item: any) =>
        item._id.equals(questionId)
      );
      if (!question) {
        return next(new Errorhandler("Invalid question id", 400));
      }

      //create a new answer object
      const newAnswer: any = {
        user: req.user,
        answer,
      };

      question.questionReplies.push(newAnswer);

      await course?.save();

      if (req.user?._id === question.user._id) {
        await NotificationModel.create({
          user: question.user.name,
          title: courseContent.title,
        });
      } else {
        const data = {
          name: question.user.name,
          title: "New Question Reply Recived",
          message: `you have a new question reply in ${courseContent.title}`,
        };
        const html = await ejs.renderFile(
          path.join(__dirname, "../mails/question-reply.ejs"),
          data
        );
        try {
          await sendMail({
            email: question.user.email,
            subject: "Question Reply",
            template: "question-reply.ejs",
            data,
          });
        } catch (erro: any) {
          return next(new Errorhandler(erro.message, 500));
        }
      }

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new Errorhandler(error.message, 500));
    }
  }
);

//add review in course
export const addReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;
      const courseId = req.params.id;
      const courseExists = userCourseList?.some(
        (course: any) => course._id.toString() === courseId.toString()
      );
      if (!courseExists) {
        return next(
          new Errorhandler("Your not eligble to access this course", 404)
        );
      }
      const course = await CourseModel.findById(courseId);

      const { review, rating } = req.body as IAddReviewData;
      const reviewData: any = {
        user: req.user,
        comment: review,
        rating,
      };
      course?.reviews.push(reviewData);

      let avg = 0;

      course?.reviews.forEach((rev: any) => (avg += rev.rating));

      if (course) {
        course.ratings = avg / course.reviews.length;
      }

      await course?.save();

      const notification = {
        title: "New Review Recived",
        message: `${req.user?.name} has given a review on your in ${course?.name}`,
      };

      //create a notification
      res.status(200).json({ success: true, course });
    } catch (error: any) {
      return next(new Errorhandler(error.message, 500));
    }
  }
);

//add reply to a review
export const addReplyReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, courseId, reviewId } = req.body as IAddReviewAnswer;

      const course = await CourseModel.findById(courseId);
      if (!course) {
        return next(new Errorhandler("Course not found", 404));
      }
      const review = course?.reviews?.find(
        (rev: any) => rev._id.toString() === reviewId
      );
      if (!review) {
        return next(new Errorhandler("Review not found", 404));
      }

      const replyData: any = {
        user: req.user,
        comment,
      };

      if (!review.commentReplies) {
        review.commentReplies = [];
      }

      review.commentReplies?.push(replyData);

      await course?.save();
      res.status(200).json({ sucess: true, course });
    } catch (error: any) {
      return next(new Errorhandler(error.message, 500));
    }
  }
);

//get all courses

export const getAllCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllCoursesService(res);
    } catch (error: any) {
      return next(new Errorhandler(error.message, 500));
    }
  }
);

//delete course  by admin
export const deleteCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const course = await CourseModel.findById(id);
      if (!course) {
        return next(new Errorhandler("Course Not found", 404));
      }
      await course.deleteOne({ id });
      await redis.del(id);
      res.status(200).json({
        success: true,
        message: "Course deleted Successfully",
      });
    } catch (error: any) {
      return next(new Errorhandler(error.message, 500));
    }
  }
);

import { app } from "./app";
import "dotenv/config";
import connectDb from "./utils/connection";
import { redis } from "./utils/redis";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});
app.listen(process.env.PORT, () => {
  console.log(`SERVER Running on port ${process.env.PORT}`);
  connectDb();
  redis;
});

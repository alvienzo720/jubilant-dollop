import { app } from "./app";
import "dotenv/config";
import connectDb from "./utils/connection";
import { redis } from "./utils/redis";
app.listen(process.env.PORT, () => {
  console.log(`SERVER Running on port ${process.env.PORT}`);
  connectDb();
  // redis;
});


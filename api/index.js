import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

//routes import
import userRoutes from "./routes/user.js";

dotenv.config();

//mongodb connection
mongoose
  .connect(process.env.MONGO_URL, {
    dbName: "chat_app_mern",
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((e) => {
    console.log(e);
  });

const app = express();

//cors
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

app.use(express.json());
app.use(cookieParser());

//routes
app.use("/api/v1/user", userRoutes);

//server connection
app.listen(4000, () => {
  console.log("Connected to server");
});

app.get("/", (req, res) => {
  res.json("Working fine on the backend side");
});

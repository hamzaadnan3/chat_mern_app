import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";

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
const server = app.listen(4000, () => {
  console.log("Connected to server");
});

//websocket server connection
const wsServer = new WebSocketServer({ server });

wsServer.on("connection", (connection, req) => {
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies
      .split(";")
      .find((str) => str.startsWith("token="));
    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];
      if (token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
          if (err) throw err;
          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }
  [...wsServer.clients].forEach((client) =>
    client.send(
      JSON.stringify({
        online: [...wsServer.clients].map((c) => ({
          userId: c.userId,
          username: c.username,
        })),
      })
    )
  );
});

app.get("/", (req, res) => {
  res.json("Working fine on the backend side");
});

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import MessageModel from "./models/message.js";

//routes import
import userRoutes from "./routes/user.js";
import messageRoutes from "./routes/message.js";

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
app.use("/api/v1/message", messageRoutes);

//server connection
const server = app.listen(4000, () => {
  console.log("Connected to server");
});

//websocket server connection
const wsServer = new WebSocketServer({ server });

wsServer.on("connection", (connection, req) => {
  //function for online poeple
  function notifyOnlinePoeple() {
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
  }

  //pinging users to know if they are online or not after every 5 seconds
  //  by pinging and waiting for the ping response for 1 second timeout
  connection.isAlive = true;
  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyOnlinePoeple();
    }, 1000);
  }, 5000);

  //ping reply
  connection.on("pong", () => {
    clearTimeout(connection.deathTimer);
  });

  //reading username and userId from cookies and sencing it as an object to connection
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

  //sending message
  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString());
    const { recepient, text } = messageData;
    if (recepient && text) {
      const messageDoc = await MessageModel.create({
        sender: connection.userId,
        recepient,
        text,
      });
      [...wsServer.clients]
        .filter((c) => c.userId === recepient)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              text,
              sender: connection.userId,
              id: messageDoc._id,
            })
          )
        );
    }
  });

  //notifying all the users whenever a new user makes a websocket connection about that user
  notifyOnlinePoeple();
});

app.get("/", (req, res) => {
  res.json("Working fine on the backend side");
});

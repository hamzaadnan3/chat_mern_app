import express from "express";
import { getMessages } from "../controllers/message.js";

const router = express.Router();

router.get("/getmessages/:userId", getMessages);

export default router;

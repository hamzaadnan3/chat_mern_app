import MessageModel from "../models/message.js";
import jwt from "jsonwebtoken";

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { token } = req.cookies;
    if (token) {
      const userData = jwt.verify(token, process.env.JWT_SECRET);

      const ourUserId = userData.userId;
      const messages = await MessageModel.find({
        sender: { $in: [userId, ourUserId] },
        recepient: { $in: [userId, ourUserId] },
      }).sort({ createdAt: 1 });
      res.json(messages);
    } else {
      res.status(401).json({
        success: false,
        message: "No token",
      });
    }
  } catch (error) {
    throw error;
  }
};

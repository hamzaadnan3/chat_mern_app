import UserModel from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const createdUser = await UserModel.create({
      username,
      password: hashedPassword,
    });
    const token = jwt.sign(
      { userId: createdUser._id, username },
      process.env.JWT_SECRET
    );

    res
      .status(201)
      .cookie("token", token, { sameSite: "none", secure: true })
      .json({
        success: true,
        id: createdUser._id,
      });
  } catch (error) {
    throw error;
  }
};

export const profile = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (token) {
      const userData = jwt.verify(token, process.env.JWT_SECRET);
      res.status(200).json({
        userData,
      });
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

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const foundUser = await UserModel.findOne({ username });
    if (foundUser) {
      const isMatchedPassword = bcrypt.compareSync(
        password,
        foundUser.password
      );
      if (isMatchedPassword) {
        const token = jwt.sign(
          { userId: foundUser._id, username },
          process.env.JWT_SECRET
        );
        res
          .status(200)
          .cookie("token", token, { sameSite: "none", secure: true })
          .json({
            success: true,
            id: foundUser._id,
          });
      } else {
        res.status(400).json({
          success: false,
          message: "Invalid credentials",
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    throw error;
  }
};

export const getAllPoeple = async (req, res) => {
  try {
    const users = await UserModel.find({}, { _id: 1, username: 1 });
    res.json(users);
  } catch (error) {
    throw error;
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("token", "", { sameSite: "none", secure: true }).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    throw error;
  }
};

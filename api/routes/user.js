import express from "express";
import {
  getAllPoeple,
  login,
  logout,
  profile,
  register,
} from "../controllers/user.js";

const router = express.Router();

router.post("/register", register);
router.get("/profile", profile);
router.post("/login", login);
router.post("/logout", logout);
router.get("/people", getAllPoeple);

export default router;

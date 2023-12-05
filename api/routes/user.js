import express from "express";
import { login, profile, register } from "../controllers/user.js";

const router = express.Router();

router.post("/register", register);
router.get("/profile", profile);
router.post("/login", login);

export default router;

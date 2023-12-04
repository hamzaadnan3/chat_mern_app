import express from "express";
import { profile, register } from "../controllers/user.js";

const router = express.Router();

router.post("/register", register);
router.get("/profile", profile);

export default router;

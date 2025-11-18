import express from "express";
import {
  getUserGamificationProfile,
  getLeaderboard,
  getAllAchievements,
  getUserAchievements,
} from "../controllers/gamificationController.js";
import { authenticate } from "../middlewares/authentication.js";

const router = express.Router();

// Public routes - Transparency & engagement
router.get("/leaderboard", getLeaderboard);
router.get("/achievements", getAllAchievements);

// Protected routes - User-specific data
router.get("/profile/:userId", authenticate, getUserGamificationProfile);
router.get("/achievements/:userId", authenticate, getUserAchievements);

export default router;

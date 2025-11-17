import express from "express";
import {
  getUserGamificationProfile,
  getLeaderboard,
  getAllAchievements,
  getUserAchievements,
} from "../controllers/gamificationController.js";

const router = express.Router();

// GET user gamification profile
router.get("/profile/:userId", getUserGamificationProfile);

// GET leaderboard (query: ?type=points|donations|volunteers&limit=100)
router.get("/leaderboard", getLeaderboard);

// GET all available achievements
router.get("/achievements", getAllAchievements);

// GET user achievements status
router.get("/achievements/:userId", getUserAchievements);

export default router;

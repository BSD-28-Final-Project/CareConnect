import express from "express";
import {
  createNews,
  getAllNews,
  getNewsByActivity,
  getLatestNews,
  getNewsById,
  updateNews,
  deleteNews,
} from "../controllers/newsController.js";

const router = express.Router();

// General news routes
router.post("/", createNews);                       // Create news
router.get("/", getAllNews);                        // Get all news (with optional filter)
router.get("/latest", getLatestNews);               // Get latest news

// Specific news routes
router.get("/:id", getNewsById);                    // Get news by ID
router.put("/:id", updateNews);                     // Update news
router.delete("/:id", deleteNews);                  // Delete news

// Activity-specific news routes
router.get("/activity/:activityId", getNewsByActivity);  // Get news by activity

export default router;

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
import { authenticate, isAdmin } from "../middlewares/authentication.js";

const router = express.Router();

// Public routes - Anyone can read news
router.get("/", getAllNews);
router.get("/latest", getLatestNews);
router.get("/activity/:activityId", getNewsByActivity);
router.get("/:id", getNewsById);

// Protected routes - Only authenticated users can manage news
router.post("/", authenticate, createNews);
router.put("/:id", authenticate, isAdmin, updateNews);
router.delete("/:id", authenticate, isAdmin, deleteNews); // Admin only

export default router;

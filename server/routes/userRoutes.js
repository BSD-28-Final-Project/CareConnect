import express from "express";
import { 
  registerUser, 
  loginUser, 
  getUserProfile,
  updateUserProfile,
  getUserById
} from "../controllers/userController.js";
import { authenticate } from "../middlewares/authentication.js";

const router = express.Router();

// Public routes
// POST /api/users/register - Register new user
router.post("/register", registerUser);

// POST /api/users/login - Login user
router.post("/login", loginUser);

// Protected routes (require authentication)
// GET /api/users/profile - Get own profile
router.get("/profile", authenticate, getUserProfile);

// PUT /api/users/profile - Update own profile
router.put("/profile", authenticate, updateUserProfile);

// GET /api/users/:id - Get user by ID (own profile or admin)
router.get("/:id", authenticate, getUserById);

export default router;
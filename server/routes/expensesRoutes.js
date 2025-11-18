import express from "express";
import {
  createExpense,
  getExpenses,
  getExpensesByActivity,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";
import { authenticate, isAdmin } from "../middlewares/authentication.js";

const router = express.Router();

// Public routes - Transparency (anyone can view expenses)
router.get("/", getExpenses);
router.get("/activity/:activityId", getExpensesByActivity);
router.get("/:id", getExpenseById);

// Protected routes - Only authenticated users can manage expenses
router.post("/", authenticate, createExpense);
router.put("/:id", authenticate, isAdmin, updateExpense);
router.delete("/:id", authenticate, isAdmin, deleteExpense); // Admin only

export default router;

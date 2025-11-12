import express from "express";
import {
  createExpense,
  getExpenses,
  getExpensesByActivity,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";

const router = express.Router();

// General expense routes
router.post("/", createExpense);                    // Create expense
router.get("/", getExpenses);                       // Get all expenses (with optional filter)

// Specific expense routes
router.get("/:id", getExpenseById);                 // Get expense by ID
router.put("/:id", updateExpense);                  // Update expense
router.delete("/:id", deleteExpense);               // Delete expense

// Activity-specific expense routes
router.get("/activity/:activityId", getExpensesByActivity);  // Get expenses by activity

export default router;

import { getExpenseCollection } from "../models/expenseModel.js";
import { getActivityCollection } from "../models/activityModel.js";
import { ObjectId } from "mongodb";

/**
 * CREATE EXPENSE
 * Add expense record for an activity
 */
export const createExpense = async (req, res, next) => {
  try {
    const { activityId, title, amount } = req.body;

    // Validation
    if (!activityId || !title || !amount) {
      return res.status(400).json({ 
        message: "activityId, title, and amount are required" 
      });
    }

    if (!ObjectId.isValid(activityId)) {
      return res.status(400).json({ message: "Invalid activityId format" });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ 
        message: "Amount must be a positive number" 
      });
    }

    // Check if activity exists
    const activityCollection = await getActivityCollection();
    const activity = await activityCollection.findOne({ 
      _id: new ObjectId(activityId) 
    });

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    const collection = await getExpenseCollection();

    const expense = {
      activityId: new ObjectId(activityId),
      title: title.trim(),
      amount,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(expense);
    const insertedExpense = await collection.findOne({ _id: result.insertedId });

    res.status(201).json({ 
      message: "Expense created successfully",
      data: insertedExpense
    });
  } catch (error) {
    console.error("Error creating expense:", error);
    next(error);
  }
};

/**
 * GET ALL EXPENSES
 * Optional filter by activityId
 */
export const getExpenses = async (req, res, next) => {
  try {
    const { activityId } = req.query;
    const collection = await getExpenseCollection();

    const filter = {};
    if (activityId) {
      if (!ObjectId.isValid(activityId)) {
        return res.status(400).json({ message: "Invalid activityId format" });
      }
      filter.activityId = new ObjectId(activityId);
    }

    const expenses = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ 
      data: expenses,
      total: expenses.length
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    next(error);
  }
};

/**
 * GET EXPENSES BY ACTIVITY ID
 * Get expense history for specific activity
 */
export const getExpensesByActivity = async (req, res, next) => {
  try {
    const { activityId } = req.params;

    if (!ObjectId.isValid(activityId)) {
      return res.status(400).json({ message: "Invalid activityId format" });
    }

    const collection = await getExpenseCollection();
    const expenses = await collection
      .find({ activityId: new ObjectId(activityId) })
      .sort({ createdAt: -1 })
      .toArray();

    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    res.status(200).json({ 
      data: expenses,
      total: expenses.length,
      totalAmount: totalExpenses
    });
  } catch (error) {
    console.error("Error fetching expenses by activity:", error);
    next(error);
  }
};

/**
 * GET EXPENSE BY ID
 */
export const getExpenseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid expense ID format" });
    }

    const collection = await getExpenseCollection();
    const expense = await collection.findOne({ _id: new ObjectId(id) });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ data: expense });
  } catch (error) {
    console.error("Error fetching expense:", error);
    next(error);
  }
};

/**
 * UPDATE EXPENSE
 */
export const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, amount } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid expense ID format" });
    }

    const updateData = { updatedAt: new Date() };

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        return res.status(400).json({ message: "Title must be a non-empty string" });
      }
      updateData.title = title.trim();
    }

    if (amount !== undefined) {
      if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }
      updateData.amount = amount;
    }

    const collection = await getExpenseCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ 
      message: "Expense updated successfully",
      data: result
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    next(error);
  }
};

/**
 * DELETE EXPENSE
 */
export const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid expense ID format" });
    }

    const collection = await getExpenseCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    next(error);
  }
};

import express from "express";
import {
  addPaymentMethod,
  createSubscription,
  getSubscriptionDetails,
  updateSubscriptionAmount,
  cancelSubscription,
  getSubscriptionHistory
} from "../controllers/subscriptionController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/payment-method", authMiddleware, addPaymentMethod);
router.post("/", authMiddleware, createSubscription);
router.get("/details", authMiddleware, getSubscriptionDetails);
router.patch("/update", authMiddleware, updateSubscriptionAmount);
router.delete("/cancel", authMiddleware, cancelSubscription);
router.get("/history", authMiddleware, getSubscriptionHistory);

export default router;

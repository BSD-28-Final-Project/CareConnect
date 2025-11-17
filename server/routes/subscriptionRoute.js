import express from "express";
import {
  addPaymentMethod,
  createSubscription,
  getSubscriptionDetails,
  updateSubscriptionAmount,
  cancelSubscription,
  getSubscriptionHistory,
  handleRecurringWebhook,
  getSubscriptionDonations
} from "../controllers/subscriptionController.js";
import { authenticate } from "../middlewares/authentication.js";

const router = express.Router();

// Protected routes (require authentication)
router.post("/payment-method", authenticate, addPaymentMethod);
router.post("/", authenticate, createSubscription);
router.get("/details", authenticate, getSubscriptionDetails);
router.patch("/update", authenticate, updateSubscriptionAmount);
router.delete("/cancel", authenticate, cancelSubscription);
router.get("/history", authenticate, getSubscriptionHistory);
router.get("/donations", authenticate, getSubscriptionDonations);

// Webhook endpoint (NO authentication - called by Xendit)
router.post("/webhook/xendit", handleRecurringWebhook);

export default router;

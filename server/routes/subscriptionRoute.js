import express from "express";
import {
  getSubscriptionPlans,
  addPaymentMethod,
  createSubscription,
  getSubscriptionDetails,
  updateSubscriptionAmount,
  cancelSubscription,
  getSubscriptionHistory,
  handleRecurringWebhook,
  getSubscriptionDonations,
} from "../controllers/subscriptionController.js";
import { authenticate } from "../middlewares/authentication.js";

const router = express.Router();

// Public routes
router.get("/plans", getSubscriptionPlans);

// Protected routes (require authentication)
router.post("/payment-method", authenticate, addPaymentMethod);
router.get("/payment-methods", authenticate, async (req, res) => {
  // Check if user has payment method
  try {
    const { getUserCollection } = await import("../models/userModel.js");
    const users = await getUserCollection();
    const userId = req.user._id || req.user.id || req.user;
    const { ObjectId } = await import("mongodb");

    const user = await users.findOne({ _id: new ObjectId(userId) });

    if (user && user.paymentMethodId) {
      res.json({
        success: true,
        data: [
          {
            id: user.paymentMethodId,
            type: user.paymentMethodType || "CARD",
          },
        ],
      });
    } else {
      res.json({ success: true, data: [] });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payment methods" });
  }
});

router.get("/my-subscription", authenticate, async (req, res) => {
  // Get user's active subscription
  try {
    const { getSubscriptionCollection } = await import(
      "../models/subscriptionModel.js"
    );
    const subs = await getSubscriptionCollection();
    const userId = req.user._id || req.user.id || req.user;
    const { ObjectId } = await import("mongodb");

    const subscription = await subs.findOne({
      userId: new ObjectId(userId),
      active: true,
    });

    if (subscription) {
      res.json({ success: true, data: subscription });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch subscription" });
  }
});

router.post("/", authenticate, createSubscription);
router.get("/details", authenticate, getSubscriptionDetails);
router.patch("/update", authenticate, updateSubscriptionAmount);
router.delete("/", authenticate, cancelSubscription);
router.get("/history", authenticate, getSubscriptionHistory);
router.get("/donations", authenticate, getSubscriptionDonations);

// Webhook endpoint (NO authentication - called by Xendit)
router.post("/webhook/xendit", handleRecurringWebhook);

export default router;

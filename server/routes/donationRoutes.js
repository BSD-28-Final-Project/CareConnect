import express from "express";
import {
  createDonation,
  getDonations,
  getDonationById,
  handleXenditWebhook,
} from "../controllers/donationController.js";
import { authenticate } from "../middlewares/authentication.js";

const router = express.Router();

// Public route - Xendit webhook callback
router.post("/webhook/xendit", handleXenditWebhook);

// Protected routes - Must be authenticated
router.post("/", authenticate, createDonation);
router.get("/", authenticate, getDonations);
router.get("/:id", authenticate, getDonationById);

export default router;

import express from "express";
import {
  createDonation,
  getDonations,
  getDonationById,
  handleXenditWebhook,
} from "../controllers/donationController.js";
import { authenticate } from "../middlewares/authentication.js";

const router = express.Router();

router.post("/", createDonation);
router.get("/", getDonations);
router.get("/:id", getDonationById);

// Xendit webhook endpoint
router.post("/webhook/xendit", handleXenditWebhook);

export default router;

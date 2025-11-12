import express from "express";
import {
  createDonation,
  getDonations,
  getDonationById,
} from "../controllers/donationController.js";

const router = express.Router();

router.post("/", createDonation);
router.get("/", getDonations);
router.get("/:id", getDonationById);

export default router;

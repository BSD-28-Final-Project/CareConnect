import express from "express";
import {
  getActivities,
  createActivity,
  getActivityById,
  updateActivity,
  deleteActivity,
  registerVolunteer,
  unregisterVolunteer,
  addDonation,
} from "../controllers/activityController.js";
import {
  validate,
  validateActivityPayload,
  validateVolunteerPayload,
} from "../middlewares/errorhandler.js";
import { authenticate, isAdmin } from "../middlewares/authentication.js";

const router = express.Router();

// Public routes
router.get("/", getActivities); // Anyone can browse activities
router.get("/:id", getActivityById); // Anyone can view activity details

// Protected routes - Must be authenticated
router.post("/", authenticate, isAdmin, validate(validateActivityPayload), createActivity);
router.put("/:id", authenticate, isAdmin, updateActivity);
router.delete("/:id", authenticate, isAdmin, deleteActivity); // Admin only

// Volunteer routes - Must be authenticated
router.post("/:id/volunteer", authenticate, validate(validateVolunteerPayload), registerVolunteer);
router.delete("/:id/volunteer/:volunteerId", authenticate, unregisterVolunteer);

// Donations
router.post("/:id/donation", addDonation); //done

export default router;
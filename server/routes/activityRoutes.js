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

const router = express.Router();

// Activities collection
router.get("/activities", getActivities); // done
router.post("/activities", validate(validateActivityPayload), createActivity); //done

// Single activity
router.get("/activities/:id", getActivityById); //done
router.put("/activities/:id", updateActivity);
router.delete("/activities/:id", deleteActivity);

// Volunteers
router.post("/activities/:id/volunteer", validate(validateVolunteerPayload), registerVolunteer);
router.delete("/activities/:id/volunteer/:volunteerId", unregisterVolunteer);

// Donations
router.post("/activities/:id/donation", addDonation);

export default router;
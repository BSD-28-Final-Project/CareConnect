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
router.get("/", getActivities); // done
router.post("/", validate(validateActivityPayload), createActivity); //done

// Single activity
router.get("/:id", getActivityById); //done
router.put("/:id", updateActivity); // done
router.delete("/:id", deleteActivity); // done

// Volunteers
router.post("/:id/volunteer", validate(validateVolunteerPayload), registerVolunteer); //done
router.delete("/:id/volunteer/:volunteerId", unregisterVolunteer); //done

// Donations
router.post("/:id/donation", addDonation); //done

export default router;
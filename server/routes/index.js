// routes/index.js
import express from "express";
const route = express.Router();

// import authRoutes from "./userRoutes.js"; // FIXED - was a function, not router
import activityRoutes from "./activityRoutes.js";
// import donationRoutes from "./donationRoutes.js"; // FIXED - was a function, not router

// route.use("/", authRoutes); // FIXED - was causing hang
route.use("/", activityRoutes);
// route.use("/", donationRoutes); // FIXED - was causing hang

export default route;

// routes/index.js
import express from "express";
const route = express.Router();
import activityRoutes from "./activityRoutes.js";
import donationRoutes from "./donationRoutes.js";


route.use("/activities", activityRoutes);
route.use("/donations", donationRoutes);

export default route;

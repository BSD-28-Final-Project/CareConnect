// routes/index.js
import express from "express";
const route = express.Router();
import activityRoutes from "./activityRoutes.js";
import donationRoutes from "./donationRoutes.js";
import userRoutes from "./userRoutes.js";

route.use("/activities", activityRoutes);
route.use("/donations", donationRoutes);
route.use("/users", userRoutes);

export default route;

// routes/index.js
import express from "express";
const route = express.Router();
import activityRoutes from "./activityRoutes.js";
import donationRoutes from "./donationRoutes.js";
import userRoutes from "./userRoutes.js";
import expensesRoutes from "./expensesRoutes.js";
import newsRoutes from "./newsRouter.js";
import subscriptionRoutes from "./subscriptionRoute.js";

route.use("/activities", activityRoutes);
route.use("/donations", donationRoutes);
route.use("/users", userRoutes);
route.use("/expenses", expensesRoutes);
route.use("/news", newsRoutes);
route.use("/subscriptions", subscriptionRoutes);


export default route;

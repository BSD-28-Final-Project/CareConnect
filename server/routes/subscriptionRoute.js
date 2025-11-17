import express from "express";
import { subscribe } from "../controllers/subscriptionController.js";
import { authenticate } from "../middlewares/authentication.js";

const router = express.Router();

router.post("/", authenticate, subscribe);

export default router;

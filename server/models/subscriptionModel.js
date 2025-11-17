import { connectDB } from "../config/database.js";

export async function getSubscriptionCollection() {
  const db = await connectDB();
  return db.collection("subscriptions");
}

export async function getSubscriptionPaymentCollection() {
  const db = await connectDB();
  return db.collection("subscriptionPayments");
}

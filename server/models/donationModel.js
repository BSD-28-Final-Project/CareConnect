import { connectDB } from "../config/database.js";

export async function getDonationCollection() {
  const db = await connectDB();
  return db.collection("donations");
}

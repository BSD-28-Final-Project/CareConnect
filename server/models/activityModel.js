import { connectDB } from "../config/database.js";

export async function getActivityCollection() {
  const db = await connectDB();
  return db.collection("activities");
}

import { connectDB } from "../config/database.js";

export async function getNewsCollection() {
  const db = await connectDB();
  return db.collection("activityNews");
}

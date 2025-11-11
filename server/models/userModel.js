import { connectDB } from "../config/database.js";

export async function getUserCollection() {
  const db = await connectDB();
  return db.collection("users");
}

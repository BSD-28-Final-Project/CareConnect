import { connectDB } from "../config/database.js";

export async function getExpenseCollection() {
  const db = await connectDB();
  return db.collection("expenses");
}
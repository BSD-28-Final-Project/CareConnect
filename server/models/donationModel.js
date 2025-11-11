import { connectDB } from "../config/database.js";

export const getDonationCollection = async () => {
  const db = await connectDB();
  return db.collection("donations");
};
